"use client";

import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

type AmountSelectorProps = {
  amount: string;
  onAmountChange: (amount: string) => void;
};

export function AmountSelector({
  amount,
  onAmountChange,
}: AmountSelectorProps) {
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
          className="w-full border-2 border-black bg-white py-4 pl-10 pr-4 text-3xl font-black text-black placeholder:text-gray-300 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {QUICK_AMOUNTS.map((qa) => (
          <button
            key={qa}
            type="button"
            onClick={() => onAmountChange(qa.toString())}
            className={cn(
              "border-2 px-4 py-2 text-sm font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none",
              amount === qa.toString()
                ? "border-black bg-chainlink text-white"
                : "border-black bg-white text-black hover:bg-white",
            )}
          >
            ${qa}
          </button>
        ))}
      </div>
    </div>
  );
}
