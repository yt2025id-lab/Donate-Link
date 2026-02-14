"use client";

import { cn } from "@/lib/utils";
import {
  CHAIN_DISPLAY_NAMES,
  CHAIN_COLORS,
  type SupportedChainKey,
} from "@/lib/chains";

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

export function ChainSelector({
  selectedChain,
  onChainChange,
}: ChainSelectorProps) {
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
              "relative flex flex-col items-center gap-2 border-2 p-3 transition-all",
              selectedChain === chain.key
                ? "border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1"
                : "border-black bg-white hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            )}
          >
            <div
              className="h-4 w-4 rounded-full border border-black"
              style={{ backgroundColor: CHAIN_COLORS[chain.key] }}
            />
            <span className="text-xs font-bold text-black uppercase">
              {CHAIN_DISPLAY_NAMES[chain.key]}
            </span>
            {chain.badge && (
              <span className="absolute -right-2 -top-2 border-2 border-black bg-accent px-2 py-0.5 text-[10px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
