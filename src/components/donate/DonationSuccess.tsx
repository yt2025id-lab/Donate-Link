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
      className="rounded-2xl border border-accent/30 bg-surface-card p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
      </motion.div>

      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Donation Sent!
      </h2>
      <p className="mb-6 text-4xl font-bold text-accent">
        {formatUsd(amountUsd)}
      </p>
      <p className="mb-6 text-sm text-text-secondary">
        Paid with {tokenSymbol}
      </p>

      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2">
        <span className="text-xs text-text-muted">TX:</span>
        <span className="text-xs text-text-secondary">
          {truncateAddress(txHash, 8)}
        </span>
        <button onClick={copyTxHash} className="text-text-muted hover:text-text-primary">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-chainlink hover:text-chainlink-light"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <button
        onClick={onReset}
        className="rounded-xl border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-text-primary transition-all hover:bg-surface-hover"
      >
        Send Another Donation
      </button>
    </motion.div>
  );
}
