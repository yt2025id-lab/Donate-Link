'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReadContract } from 'wagmi';
import { formatEther, type Address } from 'viem';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CONTRACTS } from '@/lib/contracts';
import DonateLinkABI from '@/lib/abi/DonateLink.json';
import { useWithdrawETH } from '@/hooks/useWithdraw';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface WithdrawCardProps {
  address: Address;
}

export function WithdrawCard({ address }: WithdrawCardProps) {
  const { data: balanceRaw, isLoading: isBalanceLoading, refetch } =
    useReadContract({
      address: CONTRACTS.donateLink.address,
      abi: DonateLinkABI,
      functionName: 'getStreamerBalance',
      args: [address],
      chainId: CONTRACTS.donateLink.chainId,
    });

  const {
    withdraw,
    isWritePending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = useWithdrawETH();

  const ethBalance =
    balanceRaw !== undefined
      ? Number(formatEther(balanceRaw as bigint))
      : 0;

  const hasBalance = ethBalance > 0;
  const isBusy = isWritePending || isConfirming;

  // Toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Withdrawal successful!', {
        description: `${ethBalance.toFixed(4)} ETH has been sent to your wallet.`,
      });
      refetch();
      reset();
    }
  }, [isConfirmed, ethBalance, refetch, reset]);

  // Toast on error
  useEffect(() => {
    if (error) {
      toast.error('Withdrawal failed', {
        description: error.message?.slice(0, 120) || 'An unknown error occurred.',
      });
      reset();
    }
  }, [error, reset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface-card border border-border rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <ArrowDownToLine className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Withdraw ETH
          </h3>
          <p className="text-xs text-text-muted">
            Withdraw your available ETH balance to your wallet
          </p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-4 rounded-xl bg-surface-elevated border border-border/50 p-4">
        <p className="text-xs font-medium text-text-muted mb-1">
          Available Balance
        </p>
        {isBalanceLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-2xl font-bold text-text-primary">
            {ethBalance.toFixed(4)}{' '}
            <span className="text-sm font-medium text-text-secondary">ETH</span>
          </p>
        )}
      </div>

      {/* Withdraw Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!hasBalance || isBusy || isBalanceLoading}
        isLoading={isBusy}
        onClick={() => withdraw()}
      >
        {isBusy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isWritePending ? 'Confirm in Wallet...' : 'Confirming...'}
          </span>
        ) : hasBalance ? (
          'Withdraw'
        ) : (
          'No balance to withdraw'
        )}
      </Button>
    </motion.div>
  );
}
