"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useRealtimeDonations } from "@/hooks/useDonations";
import { formatUsd, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Donation } from "@/lib/supabase/types";

interface DonationListProps {
  streamerAddress: string;
}

function DonationRow({
  donation,
  index,
}: {
  donation: Donation;
  index: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="border-b-2 border-black hover:bg-white transition-colors"
    >
      <td className="px-4 py-4 text-sm font-bold text-black border-r-2 border-black">
        {donation.donor_name || "Anonymous"}
      </td>
      <td className="px-4 py-4 text-sm text-black font-medium max-w-[240px] truncate border-r-2 border-black">
        {donation.message || "--"}
      </td>
      <td className="px-4 py-4 text-sm font-bold text-black text-right border-r-2 border-black">
        {formatUsd(donation.amount_usd)}
      </td>
      <td className="px-4 py-4 text-sm text-black border-r-2 border-black">
        {donation.token_symbol}
      </td>
      <td className="px-4 py-4 text-sm text-black border-r-2 border-black">
        {donation.source_chain}
      </td>
      <td className="px-4 py-4 text-sm text-black text-right whitespace-nowrap font-medium">
        {timeAgo(donation.created_at)}
      </td>
    </motion.tr>
  );
}

export function DonationList({ streamerAddress }: DonationListProps) {
  const { donations, isLoading } = useRealtimeDonations(streamerAddress);

  const recentDonations = useMemo(() => donations.slice(0, 20), [donations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-black bg-white">
        <h3 className="text-xl font-bold text-black">Recent Donations</h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Showing the latest {recentDonations.length} donations
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : recentDonations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-black">
          <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
            <Inbox className="h-8 w-8" />
          </div>
          <p className="text-base font-bold">No donations yet</p>
          <p className="text-sm mt-1 font-medium text-gray-600">
            Share your donation link to start receiving support
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-black bg-white">
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-black border-r-2 border-black">
                  Donor Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-black border-r-2 border-black">
                  Message
                </th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-black border-r-2 border-black">
                  Amount (USD)
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-black border-r-2 border-black">
                  Token
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-black border-r-2 border-black">
                  Chain
                </th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-black">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentDonations.map((donation, i) => (
                <DonationRow key={donation.id} donation={donation} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
