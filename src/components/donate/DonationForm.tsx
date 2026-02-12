"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, parseUnits, type Address } from "viem";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

import { AmountSelector } from "./AmountSelector";
import { TokenSelector } from "./TokenSelector";
import { ChainSelector } from "./ChainSelector";
import { FeePreview } from "./FeePreview";
import { DonationSuccess } from "./DonationSuccess";
import { useDonateETH, useDonateToken, useCrossChainDonate } from "@/hooks/useDonate";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { TOKENS } from "@/lib/contracts";
import type { SupportedChainKey } from "@/lib/chains";

type DonationFormProps = {
  streamerAddress: string;
  streamerName: string;
};

export function DonationForm({ streamerAddress, streamerName }: DonationFormProps) {
  const { isConnected, address } = useAccount();
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
  const { price: ethPrice } = usePriceFeed(TOKENS.ETH.priceFeedAddress as Address);
  const { price: linkPrice } = usePriceFeed(TOKENS.LINK.priceFeedAddress as Address);

  const ethDonate = useDonateETH();
  const tokenDonate = useDonateToken();
  const crossChainDonate = useCrossChainDonate();

  const amountUsd = parseFloat(amount) || 0;
  const platformFeeUsd = amountUsd * 0.05;

  // Calculate token amount from USD
  const getTokenAmount = (): number => {
    if (selectedToken === "USDC") return amountUsd;
    if (selectedToken === "ETH" && ethPrice && ethPrice > 0) return amountUsd / ethPrice;
    if (selectedToken === "LINK" && linkPrice && linkPrice > 0) return amountUsd / linkPrice;
    return 0;
  };

  const tokenAmount = getTokenAmount();

  // Handle active donation states
  const isPending =
    ethDonate.isWritePending || tokenDonate.isWritePending || crossChainDonate.isWritePending;
  const isConfirming =
    ethDonate.isConfirming || tokenDonate.isConfirming || crossChainDonate.isConfirming;

  // Watch for success
  useEffect(() => {
    const hash = ethDonate.hash || tokenDonate.hash || crossChainDonate.hash;
    const isSuccess =
      ethDonate.isConfirmed || tokenDonate.isConfirmed || crossChainDonate.isConfirmed;

    if (isSuccess && hash) {
      const chainId = selectedChain === "base" ? 84532 : 11155111;
      setSuccessData({ txHash: hash, amountUsd, chainId });
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
      }).catch(() => {
        // Non-critical: CRE workflow will also record this
      });

      toast.success("Donation sent successfully!");
    }
  }, [ethDonate.isConfirmed, tokenDonate.isConfirmed, crossChainDonate.isConfirmed]);

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
            message
          );
        }
      } else {
        const ccipFee = parseEther("0.01"); // Estimated CCIP fee
        crossChainDonate.donate(
          selectedChain as "ethereum" | "arbitrum" | "optimism",
          streamer,
          token.address,
          tokenAmount.toString(),
          token.decimals,
          name,
          message,
          ccipFee
        );
      }
    } catch (err) {
      toast.error("Transaction failed. Please try again.");
    }
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
      className="space-y-5 rounded-2xl border border-border bg-surface-card p-6"
    >
      {/* Donor Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Your Name
        </label>
        <input
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Anonymous"
          maxLength={50}
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-chainlink focus:outline-none focus:ring-1 focus:ring-chainlink"
        />
      </div>

      {/* Message */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Say something nice to ${streamerName}...`}
          maxLength={200}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-chainlink focus:outline-none focus:ring-1 focus:ring-chainlink"
        />
        <p className="mt-1 text-right text-xs text-text-muted">
          {message.length}/200
        </p>
      </div>

      {/* Amount */}
      <AmountSelector amount={amount} onAmountChange={setAmount} />

      {/* Token Selection */}
      <TokenSelector selectedToken={selectedToken} onTokenChange={setSelectedToken} />

      {/* Chain Selection */}
      <ChainSelector selectedChain={selectedChain} onChainChange={setSelectedChain} />

      {/* Fee Preview */}
      <FeePreview
        amountUsd={amountUsd}
        tokenAmount={tokenAmount}
        tokenSymbol={selectedToken}
        sourceChain={selectedChain}
        platformFeeUsd={platformFeeUsd}
        ccipFeeUsd={selectedChain !== "base" ? 2.5 : undefined}
      />

      {/* Submit */}
      {!isConnected ? (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={isPending || isConfirming || amountUsd <= 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-chainlink py-4 text-base font-semibold text-white transition-all hover:bg-chainlink-light hover:shadow-lg hover:shadow-chainlink/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            "Confirm in wallet..."
          ) : isConfirming ? (
            "Confirming..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send {amountUsd > 0 ? `$${amountUsd.toFixed(2)}` : "Donation"}
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
