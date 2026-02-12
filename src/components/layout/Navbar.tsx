"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Zap } from "lucide-react";

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chainlink">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-text-primary">
              Donate<span className="text-chainlink">Link</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/leaderboard"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Leaderboard
            </Link>
            {isConnected && (
              <Link
                href="/dashboard"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </nav>
  );
}
