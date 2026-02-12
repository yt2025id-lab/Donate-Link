"use client";

import { motion } from "framer-motion";
import { formatUsd } from "@/lib/utils";
import type { Donation } from "@/lib/supabase/types";
import { Coins, MessageSquare } from "lucide-react";

type DonationAlertProps = {
  donation: Donation;
};

export function DonationAlert({ donation }: DonationAlertProps) {
  return (
    <motion.div
      initial={{ scale: 0, y: -50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="mx-auto max-w-md rounded-2xl border-2 border-chainlink bg-surface-elevated p-6 shadow-2xl shadow-chainlink/20"
    >
      {/* Header glow accent */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

      {/* Amount */}
      <p className="mb-2 text-center text-4xl font-bold text-accent">
        {formatUsd(donation.amount_usd)}
      </p>

      {/* Donor name */}
      <p className="mb-3 text-center text-lg font-semibold text-chainlink">
        {donation.donor_name || "Anonymous"}
      </p>

      {/* Message */}
      {donation.message && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface-card/80 px-4 py-3">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
          <p className="text-sm leading-relaxed text-text-primary">
            {donation.message}
          </p>
        </div>
      )}

      {/* Token + Chain info */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-card px-3 py-1">
          <Coins className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">
            {donation.amount_token} {donation.token_symbol}
          </span>
        </div>
        <div className="rounded-full border border-border bg-surface-card px-3 py-1">
          <span className="text-xs font-medium text-text-secondary">
            {donation.source_chain}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
