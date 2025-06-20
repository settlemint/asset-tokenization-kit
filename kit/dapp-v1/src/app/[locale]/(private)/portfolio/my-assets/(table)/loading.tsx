import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton section />
      <div className="flex items-center justify-end mb-4 -mt-12 z-10">
        <Skeleton className="h-10 w-24" /> {/* Transfer button */}
      </div>
      <DataTableSkeleton /> {/* MyAssetsTable */}
    </>
  );
}
