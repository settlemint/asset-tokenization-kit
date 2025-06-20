import { DetailGridSkeleton } from "@/components/blocks/skeleton/detail-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      {/* Details Skeleton */}
      <DetailGridSkeleton />
      {/* Charts Skeleton */}
      <Skeleton className="h-80 w-full bg-muted/50 rounded-xl" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
