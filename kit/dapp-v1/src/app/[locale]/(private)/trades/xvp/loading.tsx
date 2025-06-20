import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <DataTableSkeleton />
    </>
  );
}
