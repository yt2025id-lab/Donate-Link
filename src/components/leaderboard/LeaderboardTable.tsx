"use client";

import { Trophy } from "lucide-react";
import { formatUsd, truncateAddress } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/supabase/types";

const TROPHY_COLORS: Record<number, string> = {
  1: "#FFD700", // gold
  2: "#C0C0C0", // silver
  3: "#CD7F32", // bronze
};

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-card px-6 py-16 text-center">
        <p className="text-lg text-text-secondary">
          No donations recorded yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface-elevated/50">
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
              Rank
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
              Donor
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
              Name
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Donated
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
              Donations
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const trophyColor = TROPHY_COLORS[rank];

            return (
              <tr
                key={entry.donor_address}
                className="transition-colors hover:bg-surface-hover/50"
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {trophyColor ? (
                      <Trophy
                        className="h-5 w-5"
                        style={{ color: trophyColor }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-text-muted">
                        {rank}
                      </span>
                    )}
                  </div>
                </td>

                {/* Donor address */}
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-text-secondary">
                    {truncateAddress(entry.donor_address)}
                  </span>
                </td>

                {/* Donor name */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-text-primary">
                    {entry.donor_name || "Anonymous"}
                  </span>
                </td>

                {/* Total donated */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-accent">
                    {formatUsd(entry.total_donated_usd)}
                  </span>
                </td>

                {/* Donation count */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-text-secondary">
                    {entry.donation_count}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
