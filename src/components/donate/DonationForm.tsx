"use client";

import { useState, useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, type Address } from "viem";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";

import { AmountSelector } from "./AmountSelector";
import { TokenSelector } from "./TokenSelector";
import { ChainSelector } from "./ChainSelector";
import { FeePreview } from "./FeePreview";
import { DonationSuccess } from "./DonationSuccess";
import {
  useDonateETH,
  useDonateToken,
  useCrossChainDonate,
} from "@/hooks/useDonate";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useCCIPFeeEstimate } from "@/hooks/useCCIPFee";
import { TOKENS } from "@/lib/contracts";
import { SUPPORTED_CHAINS, type SupportedChainKey } from "@/lib/chains";

type DonationFormProps = {
  streamerAddress: string;
  streamerName: string;
};

export function DonationForm({
  streamerAddress,
  streamerName,
}: DonationFormProps) {
  const { isConnected, address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [selectedChain, setSelectedChain] = useState<SupportedChainKey>("base");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    txHash: string;
    amountUsd: number;
    chainId: number;
  } | null>(null);

  const token = TOKENS[selectedToken];
  const { price: ethPrice } = usePriceFeed(
    TOKENS.ETH.priceFeedAddress as Address,
  );
  const { price: linkPrice } = usePriceFeed(
    TOKENS.LINK.priceFeedAddress as Address,
  );

  const ethDonate = useDonateETH();
  const tokenDonate = useDonateToken();
  const crossChainDonate = useCrossChainDonate();

  const amountUsd = parseFloat(amount) || 0;
  const platformFeeUsd = amountUsd * 0.05;

  // Calculate token amount from USD
  const getTokenAmount = (): number => {
    if (selectedToken === "USDC") return amountUsd;
    if (selectedToken === "ETH" && ethPrice && ethPrice > 0)
      return amountUsd / ethPrice;
    if (selectedToken === "LINK" && linkPrice && linkPrice > 0)
      return amountUsd / linkPrice;
    return 0;
  };

  const tokenAmount = getTokenAmount();

  // Estimate CCIP fee from contract
  const { fee: ccipFeeWei, isLoading: isFeeLoading } = useCCIPFeeEstimate(
    selectedChain,
    token.address,
    tokenAmount.toString(),
    token.decimals,
    donorName,
    message,
  );

  // Convert CCIP fee to USD for display
  const ccipFeeEth = ccipFeeWei ? parseFloat(formatEther(ccipFeeWei)) : 0;
  const ccipFeeUsd = ccipFeeEth && ethPrice ? ccipFeeEth * ethPrice : undefined;

  // Check if user is on the correct chain
  const expectedChainId = SUPPORTED_CHAINS[selectedChain]?.id;
  const isWrongChain = isConnected && chainId !== expectedChainId;

  // Handle active donation states
  const isPending =
    ethDonate.isWritePending ||
    tokenDonate.isWritePending ||
    crossChainDonate.isWritePending;
  const isConfirming =
    ethDonate.isConfirming ||
    tokenDonate.isConfirming ||
    crossChainDonate.isConfirming;

  // Watch for success
  useEffect(() => {
    const hash = ethDonate.hash || tokenDonate.hash || crossChainDonate.hash;
    const isSuccess =
      ethDonate.isConfirmed ||
      tokenDonate.isConfirmed ||
      crossChainDonate.isConfirmed;

    if (isSuccess && hash) {
      setSuccessData({ txHash: hash, amountUsd, chainId: expectedChainId });
      setShowSuccess(true);

      // Record donation in Supabase
      fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamer_address: streamerAddress,
          donor_address: address,
          donor_name: donorName || "Anonymous",
          message,
          amount_usd: amountUsd,
          amount_token: tokenAmount,
          token_symbol: selectedToken,
          token_address: token.address,
          source_chain: selectedChain,
          tx_hash: hash,
        }),
      }).catch((err) => {
        console.warn(
          "Failed to record donation in DB (CRE workflow will retry):",
          err,
        );
      });

      toast.success("Donation sent successfully!");
    }
  }, [
    ethDonate.isConfirmed,
    tokenDonate.isConfirmed,
    crossChainDonate.isConfirmed,
  ]);

  // Watch for errors
  useEffect(() => {
    const error =
      ethDonate.error || tokenDonate.error || crossChainDonate.error;
    if (error) {
      const msg = error.message?.includes("User rejected")
        ? "Transaction rejected by user"
        : "Transaction failed. Please try again.";
      toast.error(msg);
    }
  }, [ethDonate.error, tokenDonate.error, crossChainDonate.error]);

  const handleSubmit = async () => {
    if (!isConnected || amountUsd <= 0 || tokenAmount <= 0) return;

    try {
      const name = donorName || "Anonymous";
      const streamer = streamerAddress as Address;

      if (selectedChain === "base") {
        if (selectedToken === "ETH") {
          ethDonate.donate(streamer, name, message, tokenAmount.toString());
        } else {
          tokenDonate.donate(
            streamer,
            token.address,
            tokenAmount.toString(),
            token.decimals,
            name,
            message,
          );
        }
      } else {
        // Use estimated CCIP fee with 10% buffer, or fallback
        const fee = ccipFeeWei
          ? (ccipFeeWei * BigInt(110)) / BigInt(100)
          : parseEther("0.01");

        crossChainDonate.donate(
          selectedChain as "ethereum" | "arbitrum" | "optimism",
          streamer,
          token.address,
          tokenAmount.toString(),
          token.decimals,
          name,
          message,
          fee,
        );
      }
    } catch (err) {
      toast.error("Transaction failed. Please try again.");
    }
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: expectedChainId });
  };

  const resetForm = () => {
    setShowSuccess(false);
    setSuccessData(null);
    setAmount("");
    setMessage("");
  };

  if (showSuccess && successData) {
    return (
      <DonationSuccess
        txHash={successData.txHash}
        amountUsd={successData.amountUsd}
        tokenSymbol={selectedToken}
        chainId={successData.chainId}
        onReset={resetForm}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6 border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      {/* Donor Name */}
      <div>
        <label className="mb-2 block text-sm font-bold text-black uppercase tracking-wide">
          Your Name
        </label>
        <input
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Anonymous"
          maxLength={50}
          className="w-full border-2 border-black bg-white px-4 py-3 text-black font-medium placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
      </div>

      {/* Message */}
      <div>
        <label className="mb-2 block text-sm font-bold text-black uppercase tracking-wide">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Say something nice to ${streamerName}...`}
          maxLength={200}
          rows={3}
          className="w-full resize-none border-2 border-black bg-white px-4 py-3 text-black font-medium placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
        <p className="mt-1 text-right text-xs font-bold text-gray-500">
          {message.length}/200
        </p>
      </div>

      {/* Amount */}
      <AmountSelector amount={amount} onAmountChange={setAmount} />

      {/* Token Selection */}
      <TokenSelector
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
      />

      {/* Chain Selection */}
      <ChainSelector
        selectedChain={selectedChain}
        onChainChange={setSelectedChain}
      />

      {/* Fee Preview */}
      <FeePreview
        amountUsd={amountUsd}
        tokenAmount={tokenAmount}
        tokenSymbol={selectedToken}
        sourceChain={selectedChain}
        platformFeeUsd={platformFeeUsd}
        ccipFeeUsd={selectedChain !== "base" ? ccipFeeUsd : undefined}
        isFeeLoading={selectedChain !== "base" && isFeeLoading}
      />

      {/* Wrong Chain Warning */}
      {isWrongChain && (
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Please switch to {SUPPORTED_CHAINS[selectedChain]?.name} to continue
          </span>
        </div>
      )}

      {/* Submit */}
      {!isConnected ? (
        <div className="flex justify-center border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ConnectButton />
        </div>
      ) : isWrongChain ? (
        <button
          onClick={handleSwitchChain}
          className="flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-400 py-4 text-base font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          Switch to {SUPPORTED_CHAINS[selectedChain]?.name}
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={isPending || isConfirming || amountUsd <= 0}
          className="flex w-full items-center justify-center gap-2 border-2 border-black bg-chainlink py-4 text-lg font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {isPending ? (
            "Confirm in wallet..."
          ) : isConfirming ? (
            "Confirming..."
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send {amountUsd > 0 ? `$${amountUsd.toFixed(2)}` : "Donation"}
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
