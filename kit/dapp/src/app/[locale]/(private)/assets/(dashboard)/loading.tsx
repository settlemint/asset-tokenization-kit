import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
import { AssetActivitySkeleton } from "./_components/charts/asset-activity-skeleton";
import { AssetsSupplySkeleton } from "./_components/charts/assets-supply-skeleton";
import { TransactionsHistorySkeleton } from "./_components/charts/transactions-history-skeleton";
import { UsersHistorySkeleton } from "./_components/charts/users-history-skeleton";
import { WidgetSkeleton } from "./_components/widgets/widget-skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton section />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>
      <div className="mt-8 mb-4 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0 2xl:grid-cols-4">
        <AssetsSupplySkeleton />
        <AssetActivitySkeleton />
        <UsersHistorySkeleton />
        <TransactionsHistorySkeleton />
      </div>
      <div className="mt-8 mb-4 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <DataTableSkeleton />
      <div className="mt-4 h-5 w-24 animate-pulse rounded-md bg-muted" />
    </>
  );
}
