"use client";

import { motion } from "framer-motion";
import { Globe, Bell, Coins, Link2 } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Cross-Chain Donations",
    description:
      "Accept donations from Ethereum, Arbitrum, Optimism, and Base. Powered by Chainlink CCIP for seamless cross-chain transfers.",
    color: "text-chainlink",
    bg: "bg-chainlink/10",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Get instant OBS overlay alerts when donations come in. Perfect for live streams with animated notifications.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Coins,
    title: "Low Platform Fee",
    description:
      "Only 5% platform fee. Receive donations in ETH, USDC, or LINK with real-time price feeds from Chainlink.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Link2,
    title: "On-Chain Transparency",
    description:
      "Every donation is recorded on-chain. Donors and streamers can verify all transactions on the blockchain.",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function SellingPoints() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
            Why DonateLink?
          </h2>
          <p className="mx-auto max-w-2xl text-text-secondary">
            The easiest way to support content creators with crypto, across any blockchain.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-2xl border border-border bg-surface-card p-6 transition-all hover:border-border-light hover:shadow-lg hover:shadow-chainlink/5"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
