"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CONTRACTS } from "@/lib/contracts";
import DonateLinkABI from "@/lib/abi/DonateLink.json";
import { useWithdrawETH } from "@/hooks/useWithdraw";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface WithdrawCardProps {
  address: Address;
}

export function WithdrawCard({ address }: WithdrawCardProps) {
  const {
    data: balanceRaw,
    isLoading: isBalanceLoading,
    refetch,
  } = useReadContract({
    address: CONTRACTS.donateLink.address,
    abi: DonateLinkABI,
    functionName: "getStreamerBalance",
    args: [address],
    chainId: CONTRACTS.donateLink.chainId,
  });

  const { withdraw, isWritePending, isConfirming, isConfirmed, error, reset } =
    useWithdrawETH();

  const ethBalance =
    balanceRaw !== undefined ? Number(formatEther(balanceRaw as bigint)) : 0;

  const hasBalance = ethBalance > 0;
  const isBusy = isWritePending || isConfirming;

  // Toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Withdrawal successful!", {
        description: `${ethBalance.toFixed(4)} ETH has been sent to your wallet.`,
      });
      refetch();
      reset();
    }
  }, [isConfirmed, ethBalance, refetch, reset]);

  // Toast on error
  useEffect(() => {
    if (error) {
      toast.error("Withdrawal failed", {
        description:
          error.message?.slice(0, 120) || "An unknown error occurred.",
      });
      reset();
    }
  }, [error, reset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-accent text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ArrowDownToLine className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black uppercase tracking-tight">
            Withdraw ETH
          </h3>
          <p className="text-sm font-medium text-gray-600">
            Withdraw your available ETH balance to your wallet
          </p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-6 bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
          Available Balance
        </p>
        {isBalanceLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-3xl font-black text-black">
            {ethBalance.toFixed(4)}{" "}
            <span className="text-lg font-bold text-gray-500">ETH</span>
          </p>
        )}
      </div>

      {/* Withdraw Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!hasBalance || isBusy || isBalanceLoading}
        isLoading={isBusy}
        onClick={() => withdraw()}
      >
        {isBusy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isWritePending ? "Confirm in Wallet..." : "Confirming..."}
          </span>
        ) : hasBalance ? (
          "Withdraw"
        ) : (
          "No balance to withdraw"
        )}
      </Button>
    </motion.div>
  );
}
