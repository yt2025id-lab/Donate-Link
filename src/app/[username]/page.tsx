import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreamerCard } from "@/components/donate/StreamerCard";
import { DonationForm } from "@/components/donate/DonationForm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Donate to ${username} | DonateLink`,
    description: `Support ${username} with crypto donations across any blockchain.`,
  };
}

export default async function DonatePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <StreamerCard profile={profile} />
      <DonationForm
        streamerAddress={profile.wallet_address}
        streamerName={profile.display_name || profile.username}
      />
    </div>
  );
}
