'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import DonateLinkABI from '@/lib/abi/DonateLink.json';
import { CONTRACTS } from '@/lib/contracts';

// ---------------------------------------------------------------------------
// useWithdrawETH
// ---------------------------------------------------------------------------
export function useWithdrawETH() {
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

  function withdraw() {
    writeContract({
      address: CONTRACTS.donateLink.address,
      abi: DonateLinkABI,
      functionName: 'withdrawETH',
      args: [],
      chainId: CONTRACTS.donateLink.chainId,
    });
  }

  return {
    withdraw,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    reset,
  };
}

// ---------------------------------------------------------------------------
// useWithdrawToken
// ---------------------------------------------------------------------------
export function useWithdrawToken() {
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

  function withdraw(token: Address) {
    writeContract({
      address: CONTRACTS.donateLink.address,
      abi: DonateLinkABI,
      functionName: 'withdrawToken',
      args: [token],
      chainId: CONTRACTS.donateLink.chainId,
    });
  }

  return {
    withdraw,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    reset,
  };
}
