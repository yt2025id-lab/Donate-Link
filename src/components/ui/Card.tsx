import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        hover &&
          "transition-all duration-300 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
