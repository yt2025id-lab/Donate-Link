"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

export function StreamerCard({ profile }: { profile: Profile }) {
  const initial = (profile.display_name || profile.username)
    .charAt(0)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 text-center"
    >
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center border-4 border-black bg-chainlink text-4xl font-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-black text-black">
        {profile.display_name || profile.username}
        {profile.is_registered_onchain && (
          <CheckCircle className="h-6 w-6 text-accent fill-black" />
        )}
      </h1>
      {profile.bio && (
        <p className="mx-auto max-w-sm text-base font-medium text-gray-600 border-2 border-dashed border-gray-300 p-2 bg-white">
          {profile.bio}
        </p>
      )}
    </motion.div>
  );
}
