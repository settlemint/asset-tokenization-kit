import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { PortfolioBreakdownPieChart } from "@/components/stats/charts/portfolio-breakdown-pie-chart";
import { PortfolioValueInteractiveChart } from "@/components/stats/charts/portfolio-value-interactive-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  PortfolioSummaryCards,
  PortfolioSummaryCardsSkeleton,
} from "./portfolio-summary-cards";

/**
 * Portfolio Dashboard Component
 *
 * Main dashboard view displaying comprehensive portfolio information:
 * - Portfolio header with total value, percentage change, and asset breakdown
 * - Three summary cards (Total value, Total assets, Identity status)
 * - Asset allocation pie chart
 * - Portfolio performance line chart
 *
 * Placed at the top of the main dashboard page before other content.
 */
export function PortfolioDashboard() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PortfolioDashboardSkeleton />}>
        <PortfolioDashboardContent />
      </Suspense>
    </div>
  );
}

const PortfolioDashboardContent = withErrorBoundary(
  function PortfolioDashboardContent() {
    const { data: portfolioData } = useSuspenseQuery(
      orpc.system.stats.portfolioDetails.queryOptions({
        input: {},
      })
    );

    const hasAssets = portfolioData.totalTokenFactories > 0;

    return (
      <div>
        {/* Summary Cards */}
        <PortfolioSummaryCards />

        {/* Charts Section */}
        {hasAssets && (
          <div className="mt-6 md:mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Asset Allocation Chart */}
            <PortfolioBreakdownPieChart
              breakdown={portfolioData.tokenFactoryBreakdown}
              hasAssets={hasAssets}
            />

            {/* Portfolio Performance Chart */}
            <PortfolioValueInteractiveChart defaultRange="trailing7Days" />
          </div>
        )}
      </div>
    );
  }
);

/**
 * Loading skeleton for portfolio dashboard
 */
function PortfolioDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Cards Skeleton */}
      <PortfolioSummaryCardsSkeleton />

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm"
          >
            <div className="space-y-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
