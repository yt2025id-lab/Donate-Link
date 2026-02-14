"use client";

import { motion } from "framer-motion";
import { Wallet, Search, Send } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Connect Wallet",
    description:
      "Connect with MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet.",
  },
  {
    icon: Search,
    step: "02",
    title: "Find a Creator",
    description:
      "Search for your favorite streamer or use their unique donation link.",
  },
  {
    icon: Send,
    step: "03",
    title: "Send Donation",
    description:
      "Choose your token, enter an amount in USD, add a message, and send!",
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
              <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <step.icon className="h-8 w-8 text-black" />
                <span className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-chainlink text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-black">
                {step.title}
              </h3>
              <p className="text-base text-black font-medium">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
