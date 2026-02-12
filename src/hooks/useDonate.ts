'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, type Address } from 'viem';
import DonateLinkABI from '@/lib/abi/DonateLink.json';
import DonateLinkCCIPSenderABI from '@/lib/abi/DonateLinkCCIPSender.json';
import { CONTRACTS } from '@/lib/contracts';

// ---------------------------------------------------------------------------
// useDonateETH
// ---------------------------------------------------------------------------
export function useDonateETH() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function donate(
    streamer: Address,
    donorName: string,
    message: string,
    amountEth: string,
  ) {
    writeContract({
      address: CONTRACTS.donateLink.address,
      abi: DonateLinkABI,
      functionName: 'donate',
      args: [streamer, donorName, message],
      value: parseEther(amountEth),
      chainId: CONTRACTS.donateLink.chainId,
    });
  }

  return {
    donate,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    reset,
  };
}

// ---------------------------------------------------------------------------
// useDonateToken
// ---------------------------------------------------------------------------
export function useDonateToken() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function donate(
    streamer: Address,
    token: Address,
    amount: string,
    decimals: number,
    donorName: string,
    message: string,
  ) {
    writeContract({
      address: CONTRACTS.donateLink.address,
      abi: DonateLinkABI,
      functionName: 'donateToken',
      args: [streamer, token, parseUnits(amount, decimals), donorName, message],
      chainId: CONTRACTS.donateLink.chainId,
    });
  }

  return {
    donate,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    reset,
  };
}

// ---------------------------------------------------------------------------
// useCrossChainDonate
// ---------------------------------------------------------------------------
type SourceChain = 'ethereum' | 'arbitrum' | 'optimism';

export function useCrossChainDonate() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function donate(
    sourceChain: SourceChain,
    streamer: Address,
    token: Address,
    amount: string,
    decimals: number,
    donorName: string,
    message: string,
    ccipFee: bigint,
  ) {
    const sender = CONTRACTS.ccipSenders[sourceChain];

    writeContract({
      address: sender.address,
      abi: DonateLinkCCIPSenderABI,
      functionName: 'donateCrossChain',
      args: [streamer, token, parseUnits(amount, decimals), donorName, message],
      value: ccipFee,
      chainId: sender.chainId,
    });
  }

  return {
    donate,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    reset,
  };
}
