export type Profile = {
  id: string;
  wallet_address: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  is_registered_onchain: boolean;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  streamer_id: string;
  streamer_address: string;
  donor_address: string;
  donor_name: string;
  message: string;
  amount_usd: number;
  amount_token: number;
  token_symbol: string;
  token_address: string;
  source_chain: string;
  tx_hash: string;
  ccip_message_id: string | null;
  status: string;
  created_at: string;
};

export type LeaderboardEntry = {
  donor_address: string;
  donor_name: string;
  total_donated_usd: number;
  donation_count: number;
};
