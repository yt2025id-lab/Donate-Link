"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Zap, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-chainlink/10 blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-chainlink/30 bg-chainlink/10 px-4 py-1.5 text-sm text-chainlink-light"
          >
            <Zap className="h-3.5 w-3.5" />
            Powered by Chainlink CRE
          </motion.div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Support Creators{" "}
            <span className="bg-gradient-to-r from-chainlink to-accent bg-clip-text text-transparent">
              Across Any Chain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg text-text-secondary sm:text-xl">
            Send crypto donations to your favorite streamers from any blockchain.
            Real-time alerts, cross-chain support, and full transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-chainlink px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-chainlink-light hover:shadow-lg hover:shadow-chainlink/25"
            >
              Start Receiving Donations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-elevated px-8 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-surface-hover"
            >
              View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Globe, text: "Cross-Chain via CCIP" },
            { icon: Zap, text: "Real-Time Alerts" },
            { icon: Shield, text: "5% Low Platform Fee" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated/50 px-4 py-2 text-sm text-text-secondary"
            >
              <item.icon className="h-4 w-4 text-chainlink" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
