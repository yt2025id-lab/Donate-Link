import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-chainlink">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span>DonateLink &mdash; Powered by Chainlink</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <span>Built for Chainlink Convergence Hackathon</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">Base Network</span>
        </div>
      </div>
    </footer>
  );
}
