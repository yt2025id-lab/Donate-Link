'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';

/**
 * Fetches a user profile from Supabase by wallet address and exposes helpers
 * for creating and updating profiles.
 */
export function useProfile(walletAddress?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = "no rows returned" which is expected for new users
        throw fetchError;
      }

      setProfile((data as Profile) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Create a new profile for the connected wallet.
   */
  const createProfile = useCallback(
    async (fields: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'wallet_address'>>) => {
      if (!walletAddress) {
        throw new Error('Wallet address is required to create a profile');
      }

      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          ...fields,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setProfile(data as Profile);
      return data as Profile;
    },
    [walletAddress],
  );

  /**
   * Update the existing profile for the connected wallet.
   */
  const updateProfile = useCallback(
    async (fields: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'wallet_address'>>) => {
      if (!walletAddress) {
        throw new Error('Wallet address is required to update a profile');
      }

      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress.toLowerCase())
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data as Profile);
      return data as Profile;
    },
    [walletAddress],
  );

  return { profile, isLoading, error, createProfile, updateProfile };
}
