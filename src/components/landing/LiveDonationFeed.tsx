"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useRealtimeDonations } from "@/hooks/useDonations";
import { formatUsd, truncateAddress, timeAgo } from "@/lib/utils";

export function LiveDonationFeed() {
  const { donations } = useRealtimeDonations();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Live Donations
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          {donations.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-text-muted" />
              <p className="text-text-secondary">
                No donations yet. Be the first to support a creator!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {donations.slice(0, 10).map((donation) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-chainlink text-lg font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {donation.donor_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-black">
                          {donation.donor_name}{" "}
                          <span className="text-gray-500 font-medium">
                            donated
                          </span>
                        </p>
                        {donation.message && (
                          <p className="max-w-xs truncate text-sm text-black font-medium bg-white px-2 py-0.5 mt-1 border border-black inline-block">
                            &ldquo;{donation.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-accent-light stroke-black">
                        {formatUsd(donation.amount_usd)}
                      </p>
                      <p className="text-xs font-bold text-gray-500">
                        {donation.token_symbol} &bull;{" "}
                        {timeAgo(donation.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
