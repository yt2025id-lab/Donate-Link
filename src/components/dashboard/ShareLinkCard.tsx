"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Link2, Monitor, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface ShareLinkCardProps {
  username: string;
  walletAddress: string;
}

function CopyRow({
  label,
  icon,
  url,
}: {
  label: string;
  icon: React.ReactNode;
  url: string;
}) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard!", {
        description: url,
        icon: <Check className="h-4 w-4" />,
      });
    } catch {
      toast.error("Failed to copy");
    }
  }, [url]);

  return (
    <div className="flex items-center gap-3 bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-chainlink text-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500 mb-0.5 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-bold text-black truncate">{url}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="shrink-0 hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-transparent hover:border-black transition-all"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy</span>
      </Button>
    </div>
  );
}

export function ShareLinkCard({ username, walletAddress }: ShareLinkCardProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const donationUrl = `${origin}/${username}`;
  const overlayUrl = `${origin}/overlay/${walletAddress}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-chainlink text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Link2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black uppercase tracking-tight">
            Your Links
          </h3>
          <p className="text-sm font-medium text-gray-600">
            Share these links with your audience
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <CopyRow
          label="Donation Page"
          icon={<Link2 className="h-5 w-5" />}
          url={donationUrl}
        />
        <CopyRow
          label="OBS Overlay"
          icon={<Monitor className="h-5 w-5" />}
          url={overlayUrl}
        />
      </div>
    </motion.div>
  );
}
