import { baseSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";

export const SUPPORTED_CHAINS = {
  base: baseSepolia,
  ethereum: sepolia,
  arbitrum: arbitrumSepolia,
  optimism: optimismSepolia,
} as const;

export type SupportedChainKey = keyof typeof SUPPORTED_CHAINS;

export const CHAIN_DISPLAY_NAMES: Record<SupportedChainKey, string> = {
  base: "Base",
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
};

export const CHAIN_COLORS: Record<SupportedChainKey, string> = {
  base: "#0052FF",
  ethereum: "#627EEA",
  arbitrum: "#28A0F0",
  optimism: "#FF0420",
};
