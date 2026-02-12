'use client';

import { useReadContract } from 'wagmi';
import { type Address } from 'viem';
import DonateLinkABI from '@/lib/abi/DonateLink.json';
import { CONTRACTS } from '@/lib/contracts';

/**
 * Reads the latest Chainlink price for a given token from the DonateLink
 * contract.  The on-chain value has 8 decimals, so we divide by 1e8 to return
 * a human-readable number.  Automatically refetches every 30 seconds.
 */
export function usePriceFeed(tokenAddress?: Address) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.donateLink.address,
    abi: DonateLinkABI,
    functionName: 'getLatestPrice',
    args: tokenAddress ? [tokenAddress] : undefined,
    chainId: CONTRACTS.donateLink.chainId,
    query: {
      enabled: !!tokenAddress,
      refetchInterval: 30_000,
    },
  });

  const price =
    data !== undefined && data !== null
      ? Number(data as bigint) / 1e8
      : undefined;

  return { price, isLoading, error };
}
