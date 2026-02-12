"use client";

import { cn } from "@/lib/utils";
import { CHAIN_DISPLAY_NAMES, CHAIN_COLORS, type SupportedChainKey } from "@/lib/chains";

type ChainSelectorProps = {
  selectedChain: SupportedChainKey;
  onChainChange: (chain: SupportedChainKey) => void;
};

const chains: { key: SupportedChainKey; badge?: string }[] = [
  { key: "base", badge: "Direct" },
  { key: "ethereum" },
  { key: "arbitrum" },
  { key: "optimism" },
];

export function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        Send from
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chains.map((chain) => (
          <button
            key={chain.key}
            type="button"
            onClick={() => onChainChange(chain.key)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all",
              selectedChain === chain.key
                ? "border-chainlink bg-chainlink/10"
                : "border-border bg-surface-elevated hover:border-border-light"
            )}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CHAIN_COLORS[chain.key] }}
            />
            <span className="text-xs font-medium text-text-primary">
              {CHAIN_DISPLAY_NAMES[chain.key]}
            </span>
            {chain.badge && (
              <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {chain.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {selectedChain !== "base" && (
        <p className="mt-2 text-xs text-text-muted">
          Cross-chain via Chainlink CCIP. Additional bridge fee applies.
        </p>
      )}
    </div>
  );
}
