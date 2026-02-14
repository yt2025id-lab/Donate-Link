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
            className="mb-8 inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-2 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Zap className="h-4 w-4" />
            Powered by Chainlink CRE
          </motion.div>

          {/* Headline */}
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl">
            Support Creators{" "}
            <span className="bg-chainlink text-white px-2 decoration-clone box-decoration-clone">
              Across Any Chain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-12 text-lg font-medium text-black sm:text-xl max-w-2xl mx-auto">
            Send crypto donations to your favorite streamers from any
            blockchain. Real-time alerts, cross-chain support, and full
            transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border-2 border-black bg-chainlink px-8 py-4 text-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Start Receiving Donations
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 border-2 border-black bg-white px-8 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
              className="flex items-center gap-2 border-2 border-black bg-white px-5 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <item.icon className="h-5 w-5 text-black" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
