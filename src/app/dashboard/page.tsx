'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, UserPlus, LayoutDashboard } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DonationList } from '@/components/dashboard/DonationList';
import { WithdrawCard } from '@/components/dashboard/WithdrawCard';
import { ShareLinkCard } from '@/components/dashboard/ShareLinkCard';
import type { Address } from 'viem';

/* -------------------------------------------------------------------------- */
/*  Profile Setup Form                                                         */
/* -------------------------------------------------------------------------- */

function ProfileSetup({
  onCreate,
  isCreating,
}: {
  onCreate: (username: string, displayName: string) => void;
  isCreating: boolean;
}) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      setValidationError('Username is required');
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setValidationError(
        'Username must be 3-20 characters: lowercase letters, numbers, or underscores',
      );
      return;
    }

    setValidationError('');
    onCreate(trimmedUsername, displayName.trim() || trimmedUsername);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-md"
    >
      <div className="bg-surface-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-chainlink/10 text-chainlink">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Create Your Profile
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Set up your streamer profile to start receiving donations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            placeholder="e.g. cryptostreamer"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setValidationError('');
            }}
            error={validationError}
          />
          <Input
            label="Display Name"
            placeholder="e.g. Crypto Streamer"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isCreating}
          >
            Create Profile
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Connect Wallet Prompt                                                      */
/* -------------------------------------------------------------------------- */

function ConnectWalletPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-md"
    >
      <div className="bg-surface-card border border-border rounded-2xl p-8 text-center">
        <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-chainlink/10 text-chainlink">
          <Wallet className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Connect Your Wallet
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Please connect your wallet using the button in the navigation bar to
          access your dashboard.
        </p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Content                                                          */
/* -------------------------------------------------------------------------- */

function DashboardContent({ address, username, walletAddress }: {
  address: Address;
  username: string;
  walletAddress: string;
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsCards address={address} />

      {/* Middle row: Share + Withdraw */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ShareLinkCard username={username} walletAddress={walletAddress} />
        <WithdrawCard address={address} />
      </div>

      {/* Donation history */}
      <DonationList streamerAddress={address} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const {
    profile,
    isLoading: isProfileLoading,
    createProfile,
  } = useProfile(address);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  async function handleCreate(username: string, displayName: string) {
    try {
      setIsCreating(true);
      setCreateError('');
      await createProfile({ username, display_name: displayName });
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create profile',
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="h-6 w-6 text-chainlink" />
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Dashboard
          </h1>
        </div>
        <p className="text-sm text-text-secondary ml-9">
          Manage your donations, withdraw funds, and share your links.
        </p>
      </motion.div>

      {/* Conditional Content */}
      {!isConnected ? (
        <ConnectWalletPrompt />
      ) : isProfileLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : !profile ? (
        <>
          <ProfileSetup onCreate={handleCreate} isCreating={isCreating} />
          {createError && (
            <p className="mt-4 text-center text-sm text-danger">{createError}</p>
          )}
        </>
      ) : (
        <DashboardContent
          address={address as Address}
          username={profile.username}
          walletAddress={profile.wallet_address}
        />
      )}
    </main>
  );
}
