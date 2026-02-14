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
    <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-3 text-sm font-medium">
        <div className="flex justify-between">
          <span className="text-gray-600">You send</span>
          <span className="font-bold text-black">
            {formatToken(tokenAmount)} {tokenSymbol}
            <span className="ml-1 text-gray-500 font-normal">
              ({formatUsd(amountUsd)})
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Platform fee (5%)</span>
          <span className="text-gray-500">-{formatUsd(platformFeeUsd)}</span>
        </div>
        {sourceChain !== "base" && (
          <div className="flex justify-between">
            <span className="text-gray-600">CCIP bridge fee</span>
            <span className="text-gray-500">
              {isFeeLoading
                ? "estimating..."
                : ccipFeeUsd
                  ? `~${formatUsd(ccipFeeUsd)}`
                  : "~$2-5 (estimate)"}
            </span>
          </div>
        )}
        <div className="border-t-2 border-black pt-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-black">Creator receives</span>
            <span className="text-lg font-black text-accent-light stroke-black bg-black text-white px-2 py-0.5">
              {formatUsd(streamerReceives)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
