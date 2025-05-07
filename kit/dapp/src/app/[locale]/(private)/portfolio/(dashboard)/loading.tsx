import { AssetEventsSkeleton } from "@/components/blocks/asset-events-table/asset-events-skeleton";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
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
        <AssetEventsSkeleton /> {/* MyAssetsTable */}
        <ChartSkeleton title="Transactions" /> {/* TransactionsChart */}
      </div>
      <PageHeaderSkeleton className="mt-8 mb-4" />
      <AssetEventsSkeleton /> {/* LatestEvents */}
    </>
  );
}
