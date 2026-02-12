"use client";

import { motion } from "framer-motion";
import { Wallet, Search, Send } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Connect Wallet",
    description: "Connect with MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet.",
  },
  {
    icon: Search,
    step: "02",
    title: "Find a Creator",
    description: "Search for your favorite streamer or use their unique donation link.",
  },
  {
    icon: Send,
    step: "03",
    title: "Send Donation",
    description: "Choose your token, enter an amount in USD, add a message, and send!",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface-elevated/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-text-secondary">
            Three simple steps to support your favorite creator
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-border-light to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-card">
                <step.icon className="h-7 w-7 text-chainlink" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-chainlink text-xs font-bold text-white">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
