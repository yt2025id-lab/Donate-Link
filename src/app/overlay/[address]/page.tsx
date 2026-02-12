"use client";

import { useEffect, useRef, useState, useCallback, use } from "react";
import { AnimatePresence } from "framer-motion";
import { useRealtimeDonations } from "@/hooks/useDonations";
import { DonationAlert } from "@/components/overlay/DonationAlert";
import type { Donation } from "@/lib/supabase/types";

const ALERT_DURATION_MS = 5_000;

type Props = {
  params: Promise<{ address: string }>;
};

export default function OverlayPage({ params }: Props) {
  const { address } = use(params);
  const { donations } = useRealtimeDonations(address);

  const [queue, setQueue] = useState<Donation[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Donation | null>(null);

  // Track the last seen donation id so we only queue genuinely new arrivals
  const lastSeenIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Detect new donations and add them to the queue
  useEffect(() => {
    if (donations.length === 0) return;

    const latestId = donations[0].id;

    // Skip the initial batch -- only queue donations that arrive *after* load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      lastSeenIdRef.current = latestId;
      return;
    }

    // Nothing new
    if (latestId === lastSeenIdRef.current) return;

    // Collect every donation we haven't seen yet (they are ordered newest-first)
    const newDonations: Donation[] = [];
    for (const d of donations) {
      if (d.id === lastSeenIdRef.current) break;
      newDonations.push(d);
    }

    lastSeenIdRef.current = latestId;

    // Append to queue (oldest first so they display in order)
    setQueue((prev) => [...prev, ...newDonations.reverse()]);
  }, [donations]);

  // Process the queue -- show one alert at a time for ALERT_DURATION_MS
  const processQueue = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setCurrentAlert(next);
      return rest;
    });
  }, []);

  // Kick off processing when queue gains items and nothing is currently showing
  useEffect(() => {
    if (queue.length > 0 && currentAlert === null) {
      processQueue();
    }
  }, [queue, currentAlert, processQueue]);

  // Auto-dismiss the current alert after ALERT_DURATION_MS
  useEffect(() => {
    if (!currentAlert) return;

    const timer = setTimeout(() => {
      setCurrentAlert(null);
    }, ALERT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentAlert]);

  // When the current alert is dismissed, process the next one after a brief pause
  useEffect(() => {
    if (currentAlert !== null || queue.length === 0) return;

    const gap = setTimeout(() => {
      processQueue();
    }, 300);

    return () => clearTimeout(gap);
  }, [currentAlert, queue, processQueue]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <AnimatePresence mode="wait">
        {currentAlert && (
          <DonationAlert key={currentAlert.id} donation={currentAlert} />
        )}
      </AnimatePresence>
    </div>
  );
}
