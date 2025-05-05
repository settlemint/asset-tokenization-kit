import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      {/* PageHeader Skeleton */}
      <div className="pb-6">
        <div className="mb-1">
          <Skeleton className="h-4 w-32 bg-muted/50 mb-2" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 bg-muted/50 mb-2" />
            <Skeleton className="h-4 w-32 bg-muted/50" />
          </div>
          <Skeleton className="h-10 w-32 bg-muted/50" />
        </div>
      </div>
      {/* TopInfo Skeleton */}
      <div className="mb-4 rounded-md px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 bg-muted/50" />
          <Skeleton className="h-4 w-40 bg-muted/50" />
        </div>
        <Skeleton className="h-4 w-full bg-muted/50" />
      </div>
      {/* Table Skeleton */}
      <Skeleton className="h-80 w-full bg-muted/50 rounded-xl" />
      {/* Related Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 bg-muted/50" />
        <Skeleton className="h-4 w-64 bg-muted/50" />
        <Skeleton className="h-4 w-56 bg-muted/50" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
