import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border border-border rounded-xl",
        hover &&
          "transition-all duration-300 hover:border-chainlink/40 hover:shadow-lg hover:shadow-chainlink/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
