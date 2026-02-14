import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-elevated border-2 border-black/10",
        className,
      )}
    />
  );
}

export { Skeleton, type SkeletonProps };
