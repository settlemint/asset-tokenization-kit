import { Skeleton } from "@/components/ui/skeleton";

export function TopInfoSkeleton() {
  return (
    <div className="mb-4 flex h-14 items-center justify-between rounded-md bg-muted/50 px-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="size-4" /> {/* Chevron */}
    </div>
  );
}
