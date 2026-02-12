'use client';

import { useReadContract } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import DonateLinkCCIPSenderABI from '@/lib/abi/DonateLinkCCIPSender.json';
import { CONTRACTS } from '@/lib/contracts';
import type { SupportedChainKey } from '@/lib/chains';

type SourceChain = 'ethereum' | 'arbitrum' | 'optimism';

export function useCCIPFeeEstimate(
  sourceChain: SupportedChainKey,
  token: Address,
  amount: string,
  decimals: number,
  donorName: string,
  message: string,
) {
  const isCrossChain = sourceChain !== 'base';
  const sender = isCrossChain ? CONTRACTS.ccipSenders[sourceChain as SourceChain] : null;
  const parsedAmount = amount && parseFloat(amount) > 0 ? parseUnits(amount, decimals) : BigInt(0);

  const { data: fee, isLoading, error } = useReadContract({
    address: sender?.address,
    abi: DonateLinkCCIPSenderABI,
    functionName: 'estimateFee',
    args: [token, parsedAmount, donorName || 'Anonymous', message || ''],
    chainId: sender?.chainId,
    query: {
      enabled: isCrossChain && !!sender && parsedAmount > BigInt(0),
    },
  });

  return {
    fee: fee as bigint | undefined,
    isLoading: isCrossChain && isLoading,
    error,
  };
}
