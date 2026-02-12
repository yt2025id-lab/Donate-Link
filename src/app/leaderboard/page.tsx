import { createClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | DonateLink",
  description:
    "See the most generous donors across the DonateLink platform.",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leaderboard_global")
    .select("*")
    .order("total_donated_usd", { ascending: false });

  const entries: LeaderboardEntry[] = error ? [] : (data as LeaderboardEntry[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Donation Leaderboard
        </h1>
        <p className="mx-auto max-w-lg text-text-secondary">
          Recognizing the most generous supporters across DonateLink.
          Every donation counts towards your spot on the board.
        </p>
      </div>

      {/* Table */}
      <LeaderboardTable entries={entries} />
    </div>
  );
}
