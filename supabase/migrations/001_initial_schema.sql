-- DonateLink Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_registered_onchain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT username_format
    CHECK (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- Donations table
CREATE TABLE donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    streamer_id UUID REFERENCES profiles(id) NOT NULL,
    streamer_address TEXT NOT NULL,
    donor_address TEXT NOT NULL,
    donor_name TEXT NOT NULL DEFAULT 'Anonymous',
    message TEXT DEFAULT '',
    amount_usd NUMERIC(20, 8) NOT NULL,
    amount_token NUMERIC(30, 18) NOT NULL,
    token_symbol TEXT NOT NULL,
    token_address TEXT NOT NULL,
    source_chain TEXT NOT NULL DEFAULT 'base',
    tx_hash TEXT UNIQUE NOT NULL,
    ccip_message_id TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donations_streamer ON donations(streamer_id);
CREATE INDEX idx_donations_streamer_address ON donations(streamer_address);
CREATE INDEX idx_donations_created ON donations(created_at DESC);
CREATE INDEX idx_donations_source_chain ON donations(source_chain);
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Global leaderboard view
CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT
    d.donor_address,
    d.donor_name,
    SUM(d.amount_usd) as total_donated_usd,
    COUNT(*) as donation_count
FROM donations d
WHERE d.status = 'confirmed'
GROUP BY d.donor_address, d.donor_name
ORDER BY total_donated_usd DESC
LIMIT 100;

-- Per-streamer leaderboard view
CREATE MATERIALIZED VIEW leaderboard_per_streamer AS
SELECT
    d.streamer_id,
    d.donor_address,
    d.donor_name,
    SUM(d.amount_usd) as total_donated_usd,
    COUNT(*) as donation_count
FROM donations d
WHERE d.status = 'confirmed'
GROUP BY d.streamer_id, d.donor_address, d.donor_name
ORDER BY total_donated_usd DESC;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (true);

CREATE POLICY "Donations are viewable by everyone"
    ON donations FOR SELECT USING (true);

CREATE POLICY "Service role can insert donations"
    ON donations FOR INSERT WITH CHECK (true);

-- Enable realtime for donations (critical for OBS overlay)
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
