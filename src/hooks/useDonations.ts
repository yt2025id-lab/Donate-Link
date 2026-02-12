'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Donation } from '@/lib/supabase/types';

/**
 * Fetches the initial list of donations from Supabase and subscribes to
 * real-time INSERT events on the `donations` table.  When a new row is
 * inserted, it is prepended to the local list so the UI updates instantly.
 *
 * If `streamerAddress` is provided the query and subscription are scoped to
 * that streamer; otherwise all donations are returned.
 */
export function useRealtimeDonations(streamerAddress?: string) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (streamerAddress) {
        query = query.eq('streamer_address', streamerAddress.toLowerCase());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setDonations((data as Donation[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch donations'));
    } finally {
      setIsLoading(false);
    }
  }, [streamerAddress]);

  useEffect(() => {
    fetchDonations();

    const supabase = createClient();

    const filter = streamerAddress
      ? `streamer_address=eq.${streamerAddress.toLowerCase()}`
      : undefined;

    const channel = supabase
      .channel(`donations:${streamerAddress ?? 'all'}`)
      .on<Donation>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          setDonations((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDonations, streamerAddress]);

  return { donations, isLoading, error };
}
