"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

export function StreamerCard({ profile }: { profile: Profile }) {
  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-chainlink to-accent text-3xl font-bold text-white shadow-lg shadow-chainlink/20">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      <h1 className="mb-1 flex items-center justify-center gap-1.5 text-2xl font-bold text-text-primary">
        {profile.display_name || profile.username}
        {profile.is_registered_onchain && (
          <CheckCircle className="h-5 w-5 text-accent" />
        )}
      </h1>
      {profile.bio && (
        <p className="mx-auto max-w-sm text-sm text-text-secondary">
          {profile.bio}
        </p>
      )}
    </motion.div>
  );
}
