"use client";

import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, Copy } from "lucide-react";
import { formatUsd, truncateAddress } from "@/lib/utils";
import { EXPLORER_URLS } from "@/lib/contracts";
import { toast } from "sonner";

type DonationSuccessProps = {
  txHash: string;
  amountUsd: number;
  tokenSymbol: string;
  chainId: number;
  onReset: () => void;
};

export function DonationSuccess({
  txHash,
  amountUsd,
  tokenSymbol,
  chainId,
  onReset,
}: DonationSuccessProps) {
  const explorerUrl = `${EXPLORER_URLS[chainId] || EXPLORER_URLS[84532]}/tx/${txHash}`;

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    toast.success("Transaction hash copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-black bg-accent rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="h-10 w-10 text-black" />
        </div>
      </motion.div>

      <h2 className="mb-2 text-3xl font-black text-black uppercase tracking-tight">
        Donation Sent!
      </h2>
      <p className="mb-2 text-5xl font-black text-chainlink stroke-black">
        {formatUsd(amountUsd)}
      </p>
      <p className="mb-8 text-base font-bold text-gray-500 uppercase">
        Paid with {tokenSymbol}
      </p>

      <div className="mb-8 flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-xs font-bold text-gray-500 uppercase">TX:</span>
        <span className="text-xs font-bold text-black font-mono">
          {truncateAddress(txHash, 8)}
        </span>
        <button
          onClick={copyTxHash}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-chainlink hover:text-black transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <button
        onClick={onReset}
        className="border-2 border-black bg-white px-8 py-3 text-base font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
      >
        Send Another Donation
      </button>
    </motion.div>
  );
}
