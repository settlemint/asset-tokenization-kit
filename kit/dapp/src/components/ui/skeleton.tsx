import { cn } from "@/lib/utils";

/**
 * Provides a surface-toned shimmer so skeletons blend with cards without accent flashes.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-card/90 dark:bg-card/70 shadow-inner animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
