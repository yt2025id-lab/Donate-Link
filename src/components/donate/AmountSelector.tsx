"use client";

import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

type AmountSelectorProps = {
  amount: string;
  onAmountChange: (amount: string) => void;
};

export function AmountSelector({ amount, onAmountChange }: AmountSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        Amount (USD)
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-muted">
          $
        </span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl border border-border bg-surface-elevated py-4 pl-10 pr-4 text-2xl font-bold text-text-primary placeholder:text-text-muted focus:border-chainlink focus:outline-none focus:ring-1 focus:ring-chainlink"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((qa) => (
          <button
            key={qa}
            type="button"
            onClick={() => onAmountChange(qa.toString())}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
              amount === qa.toString()
                ? "border-chainlink bg-chainlink/10 text-chainlink"
                : "border-border bg-surface-elevated text-text-secondary hover:border-border-light hover:text-text-primary"
            )}
          >
            ${qa}
          </button>
        ))}
      </div>
    </div>
  );
}
