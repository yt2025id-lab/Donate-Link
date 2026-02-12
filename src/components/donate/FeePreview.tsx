"use client";

import { formatUsd, formatToken } from "@/lib/utils";
import type { SupportedChainKey } from "@/lib/chains";

type FeePreviewProps = {
  amountUsd: number;
  tokenAmount: number;
  tokenSymbol: string;
  sourceChain: SupportedChainKey;
  platformFeeUsd: number;
  ccipFeeUsd?: number;
  isFeeLoading?: boolean;
};

export function FeePreview({
  amountUsd,
  tokenAmount,
  tokenSymbol,
  sourceChain,
  platformFeeUsd,
  ccipFeeUsd,
  isFeeLoading,
}: FeePreviewProps) {
  if (amountUsd <= 0) return null;

  const streamerReceives = amountUsd - platformFeeUsd;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated/50 p-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">You send</span>
          <span className="font-medium text-text-primary">
            {formatToken(tokenAmount)} {tokenSymbol}
            <span className="ml-1 text-text-muted">({formatUsd(amountUsd)})</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Platform fee (5%)</span>
          <span className="text-text-muted">-{formatUsd(platformFeeUsd)}</span>
        </div>
        {sourceChain !== "base" && (
          <div className="flex justify-between">
            <span className="text-text-secondary">CCIP bridge fee</span>
            <span className="text-text-muted">
              {isFeeLoading
                ? "estimating..."
                : ccipFeeUsd
                  ? `~${formatUsd(ccipFeeUsd)}`
                  : "~$2-5 (estimate)"}
            </span>
          </div>
        )}
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-text-primary">Creator receives</span>
            <span className="font-bold text-accent">{formatUsd(streamerReceives)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
