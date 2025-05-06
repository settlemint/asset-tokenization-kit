import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-48 flex-col justify-between rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
