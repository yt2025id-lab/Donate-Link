import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-chainlink/15 text-chainlink-light border-chainlink border-2",
  success: "bg-accent/15 text-accent border-accent border-2",
  warning: "bg-warning/15 text-warning border-warning border-2",
  danger: "bg-danger/15 text-danger border-danger border-2",
  muted: "bg-surface-hover text-text-muted border-black border-2",
};

function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2.5 py-0.5 text-xs font-bold",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
