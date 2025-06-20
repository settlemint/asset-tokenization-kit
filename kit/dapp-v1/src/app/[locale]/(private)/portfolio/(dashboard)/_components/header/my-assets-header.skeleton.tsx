import { Skeleton } from "@/components/ui/skeleton";

export function MyAssetsHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-muted/50" />
          <Skeleton className="h-8 w-48 bg-muted/50" />
        </div>
        <Skeleton className="h-10 w-24" /> {/* Transfer button */}
      </div>
      <Skeleton className="h-40 w-full bg-muted/50" />{" "}
      {/* PortfolioValue chart */}
    </div>
  );
}
