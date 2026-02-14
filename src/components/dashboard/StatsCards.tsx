"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { DollarSign, Hash, Wallet, Users } from "lucide-react";
import { useRealtimeDonations } from "@/hooks/useDonations";
import { CONTRACTS } from "@/lib/contracts";
import DonateLinkABI from "@/lib/abi/DonateLink.json";
import { formatUsd } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsCardsProps {
  address: Address;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  index: number;
  isLoading?: boolean;
}

function StatCard({ label, value, icon, index, isLoading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white border-2 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-chainlink text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className="text-3xl font-black text-black tracking-tight">{value}</p>
      )}
    </motion.div>
  );
}

export function StatsCards({ address }: StatsCardsProps) {
  const { donations, isLoading: isDonationsLoading } =
    useRealtimeDonations(address);

  const { data: balanceRaw, isLoading: isBalanceLoading } = useReadContract({
    address: CONTRACTS.donateLink.address,
    abi: DonateLinkABI,
    functionName: "getStreamerBalance",
    args: [address],
    chainId: CONTRACTS.donateLink.chainId,
  });

  const totalUsd = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount_usd, 0),
    [donations],
  );

  const uniqueDonors = useMemo(() => {
    const set = new Set(donations.map((d) => d.donor_address.toLowerCase()));
    return set.size;
  }, [donations]);

  const ethBalance =
    balanceRaw !== undefined ? Number(formatEther(balanceRaw as bigint)) : 0;

  const stats = [
    {
      label: "Total Donations (USD)",
      value: formatUsd(totalUsd),
      icon: <DollarSign className="h-4.5 w-4.5" />,
      isLoading: isDonationsLoading,
    },
    {
      label: "Donation Count",
      value: donations.length.toString(),
      icon: <Hash className="h-4.5 w-4.5" />,
      isLoading: isDonationsLoading,
    },
    {
      label: "Available Balance",
      value: `${ethBalance.toFixed(4)} ETH`,
      icon: <Wallet className="h-4.5 w-4.5" />,
      isLoading: isBalanceLoading,
    },
    {
      label: "Unique Donors",
      value: uniqueDonors.toString(),
      icon: <Users className="h-4.5 w-4.5" />,
      isLoading: isDonationsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          index={i}
          isLoading={stat.isLoading}
        />
      ))}
    </div>
  );
}
