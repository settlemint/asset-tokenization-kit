import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
import { GreetingSkeleton } from "./_components/greeting/greeting.skeleton";
import { MyAssetsHeaderSkeleton } from "./_components/header/my-assets-header.skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton section />
      <div className="space-y-4">
        <GreetingSkeleton />
        <MyAssetsHeaderSkeleton />
      </div>
      <PageHeaderSkeleton className="mt-8" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartSkeleton title="Asset Distribution" /> {/* AssetDistribution */}
        <DataTableSkeleton /> {/* MyAssetsTable */}
        <ChartSkeleton title="Transactions" /> {/* TransactionsChart */}
      </div>
      <PageHeaderSkeleton className="mt-8 mb-4" />
      <DataTableSkeleton /> {/* LatestEvents */}
    </>
  );
}
