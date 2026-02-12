# DonateLink

**Cross-chain crypto donation platform powered by Chainlink** — enabling fans to donate to their favorite content creators from any supported blockchain, with real-time alerts and transparent fee tracking.

Built for the [Chainlink Hackathon](https://chain.link/hackathon).

---

## How It Works

1. **Creator registers** on DonateLink and gets a shareable donation link (`donatelink.xyz/username`)
2. **Fan connects wallet** and sends a donation in ETH, USDC, or LINK
3. **Cross-chain support** — donations from Ethereum, Arbitrum, or Optimism are bridged to Base via Chainlink CCIP
4. **Real-time alerts** — OBS overlay shows animated donation alerts on the creator's livestream
5. **Creator withdraws** funds from their dashboard at any time

## Chainlink Integration

| Technology | Usage |
|---|---|
| **CCIP** | Cross-chain donation bridging (Ethereum/Arbitrum/Optimism → Base) |
| **Data Feeds** | ETH/USD and LINK/USD price conversion for accurate USD tracking |
| **Automation** | Periodic leaderboard refresh and donation milestone events |
| **CRE Workflows** | Off-chain orchestration: records donations in Supabase, enriches with CoinGecko prices, generates celebration messages via AI |

## Architecture

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Ethereum    │   │  Arbitrum    │   │  Optimism    │
│  Sepolia     │   │  Sepolia     │   │  Sepolia     │
│              │   │              │   │              │
│ CCIPSender   │   │ CCIPSender   │   │ CCIPSender   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────┬───────┘──────────────────┘
                  │  Chainlink CCIP
                  ▼
       ┌──────────────────┐     ┌──────────────────┐
       │  Base Sepolia     │     │  Chainlink        │
       │                   │     │                   │
       │  CCIPReceiver ────┤     │  Data Feeds       │
       │       │           │     │  (ETH/USD,        │
       │       ▼           │     │   LINK/USD)       │
       │  DonateLink ──────┼─────┤                   │
       │  (main contract)  │     │  Automation       │
       └────────┬──────────┘     │  (Upkeep)         │
                │                └──────────────────┘
                │  Events
                ▼
       ┌──────────────────┐     ┌──────────────────┐
       │  CRE Workflow     │     │  Next.js App      │
       │                   │     │                   │
       │  EVM Log Trigger ─┼────►│  Dashboard        │
       │  → Supabase API   │     │  Donation Page    │
       │  → CoinGecko      │     │  Leaderboard      │
       │  → OpenAI         │     │  OBS Overlay      │
       └──────────────────┘     └──────────────────┘
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Web3:** Wagmi 2, Viem, RainbowKit 2
- **Smart Contracts:** Solidity 0.8.24, Foundry
- **Database:** Supabase (PostgreSQL) with real-time subscriptions
- **Chainlink:** CCIP, Data Feeds, Automation, CRE Workflows

## Project Structure

```
├── contracts/              # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── DonateLink.sol              # Core donation & withdrawal logic
│   │   ├── DonateLinkCCIPSender.sol    # Cross-chain sender (source chains)
│   │   ├── DonateLinkCCIPReceiver.sol  # Cross-chain receiver (Base)
│   │   └── DonateLinkAutomation.sol    # Chainlink Automation upkeep
│   ├── script/             # Deployment scripts
│   └── test/               # Forge tests (16 tests)
├── cre/                    # Chainlink CRE workflow
│   └── workflows/donation-orchestrator/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── [username]/     # Public donation page
│   │   ├── dashboard/      # Creator dashboard
│   │   ├── leaderboard/    # Global donor leaderboard
│   │   ├── overlay/        # OBS real-time alerts
│   │   └── api/            # REST API routes
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks (donate, withdraw, price feed)
│   └── lib/                # Utils, ABIs, config
└── supabase/               # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Supabase](https://supabase.com) account
- [WalletConnect](https://cloud.walletconnect.com) project ID
- Testnet ETH on Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia, Optimism Sepolia

### 1. Clone & Install

```bash
git clone https://github.com/yt2025id-lab/Donate-Link.git
cd Donate-Link
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all required values — see `.env.example` for descriptions.

### 3. Setup Supabase

1. Create a new Supabase project
2. Run the migration in the SQL editor:
   ```bash
   # Copy contents of supabase/migrations/001_initial_schema.sql
   # and run it in Supabase SQL Editor
   ```
3. Copy the project URL and keys to `.env.local`

### 4. Deploy Smart Contracts

```bash
cd contracts

# Install Foundry dependencies
forge install

# Deploy to Base Sepolia (DonateLink + CCIPReceiver + Automation)
forge script script/DeployDonateLink.s.sol --rpc-url base_sepolia --broadcast --verify

# Deploy CCIPSender to Ethereum Sepolia
CCIP_ROUTER=0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59 \
DEST_CHAIN_SELECTOR=10344971235874465080 \
DEST_CCIP_RECEIVER=<your_receiver_address> \
forge script script/DeployCCIPSender.s.sol --rpc-url eth_sepolia --broadcast --verify

# Repeat for Arbitrum Sepolia and Optimism Sepolia with their respective routers
```

After deployment, update the contract addresses in `.env.local`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run Tests

```bash
# Smart contract tests
cd contracts && forge test -vvv

# Build frontend
npm run build
```

## Supported Networks (Testnet)

| Network | Chain ID | Role |
|---|---|---|
| Base Sepolia | 84532 | Main contract (receives all donations) |
| Ethereum Sepolia | 11155111 | CCIP sender |
| Arbitrum Sepolia | 421614 | CCIP sender |
| Optimism Sepolia | 11155420 | CCIP sender |

## Supported Tokens

| Token | Symbol | Pricing |
|---|---|---|
| Ethereum | ETH | Chainlink ETH/USD Data Feed |
| Chainlink | LINK | Chainlink LINK/USD Data Feed |
| USD Coin | USDC | 1:1 stablecoin (no feed needed) |

## Key Features

- **Cross-chain donations** — Send from any supported chain, received on Base
- **Real-time OBS overlay** — Animated donation alerts for livestreamers
- **Multi-token support** — ETH, USDC, LINK with live USD conversion
- **Creator dashboard** — Stats, donation history, fund withdrawal
- **Global leaderboard** — Top donors ranked by total USD donated
- **5% platform fee** — Transparent, configurable by contract owner
- **CRE orchestration** — Off-chain workflow for data enrichment and AI celebration messages

## Smart Contract Addresses

> Update after deployment

| Contract | Network | Address |
|---|---|---|
| DonateLink | Base Sepolia | `TBD` |
| CCIPReceiver | Base Sepolia | `TBD` |
| Automation | Base Sepolia | `TBD` |
| CCIPSender | Ethereum Sepolia | `TBD` |
| CCIPSender | Arbitrum Sepolia | `TBD` |
| CCIPSender | Optimism Sepolia | `TBD` |

## License

MIT
