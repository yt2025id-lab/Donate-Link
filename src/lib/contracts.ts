import { type Address } from "viem";

export const CONTRACTS = {
  donateLink: {
    address: (process.env.NEXT_PUBLIC_DONATELINK_ADDRESS || "0x") as Address,
    chainId: 84532, // Base Sepolia
  },
  ccipReceiver: {
    address: (process.env.NEXT_PUBLIC_CCIP_RECEIVER_ADDRESS || "0x") as Address,
    chainId: 84532,
  },
  ccipSenders: {
    ethereum: {
      address: (process.env.NEXT_PUBLIC_CCIP_SENDER_ETH || "0x") as Address,
      chainId: 11155111, // Sepolia
    },
    arbitrum: {
      address: (process.env.NEXT_PUBLIC_CCIP_SENDER_ARB || "0x") as Address,
      chainId: 421614, // Arbitrum Sepolia
    },
    optimism: {
      address: (process.env.NEXT_PUBLIC_CCIP_SENDER_OP || "0x") as Address,
      chainId: 11155420, // OP Sepolia
    },
  },
} as const;

export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  address: Address;
  priceFeedAddress: Address; // address(0) for ETH
};

// Token addresses per chain (Base Sepolia — update after deployment)
export const TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000" as Address,
    priceFeedAddress: "0x0000000000000000000000000000000000000000" as Address,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x") as Address,
    priceFeedAddress: "0x0000000000000000000000000000000000000000" as Address, // No feed needed (1:1)
  },
  LINK: {
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    address: (process.env.NEXT_PUBLIC_LINK_ADDRESS || "0x") as Address,
    priceFeedAddress: (process.env.NEXT_PUBLIC_LINK_ADDRESS || "0x") as Address,
  },
};

export const EXPLORER_URLS: Record<number, string> = {
  84532: "https://sepolia.basescan.org",
  11155111: "https://sepolia.etherscan.io",
  421614: "https://sepolia.arbiscan.io",
  11155420: "https://sepolia-optimism.etherscan.io",
};
