import { TopInfoSkeleton } from "@/components/blocks/top-info/top-info.skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedSkeleton } from "./_components/related.skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton section />
      <TopInfoSkeleton />
      {/* Table Skeleton */}
      <Skeleton className="h-80 w-full bg-muted/50" />
      <RelatedSkeleton />
    </>
  );
}
