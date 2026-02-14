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
            The easiest way to support content creators with crypto, across any
            blockchain.
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
              className="group border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center border-2 border-black ${feature.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
              >
                <feature.icon className={`h-7 w-7 text-black`} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-black">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-black font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
