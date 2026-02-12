'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { useRealtimeDonations } from '@/hooks/useDonations';
import { formatUsd, timeAgo } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Donation } from '@/lib/supabase/types';

interface DonationListProps {
  streamerAddress: string;
}

function DonationRow({ donation, index }: { donation: Donation; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="border-b border-border/50 last:border-b-0 hover:bg-surface-hover/40 transition-colors"
    >
      <td className="px-4 py-3 text-sm font-medium text-text-primary">
        {donation.donor_name || 'Anonymous'}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary max-w-[240px] truncate">
        {donation.message || '--'}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-text-primary text-right">
        {formatUsd(donation.amount_usd)}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {donation.token_symbol}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {donation.source_chain}
      </td>
      <td className="px-4 py-3 text-sm text-text-muted text-right whitespace-nowrap">
        {timeAgo(donation.created_at)}
      </td>
    </motion.tr>
  );
}

export function DonationList({ streamerAddress }: DonationListProps) {
  const { donations, isLoading } = useRealtimeDonations(streamerAddress);

  const recentDonations = useMemo(
    () => donations.slice(0, 20),
    [donations],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary">
          Recent Donations
        </h3>
        <p className="text-sm text-text-muted mt-0.5">
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
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Inbox className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No donations yet</p>
          <p className="text-xs mt-1">
            Share your donation link to start receiving support
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Donor Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Message
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                  Amount (USD)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Token
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Chain
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
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
