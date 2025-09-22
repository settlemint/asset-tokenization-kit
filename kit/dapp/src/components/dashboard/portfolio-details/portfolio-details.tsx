import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { PortfolioBreakdown } from "./portfolio-breakdown";
import { PortfolioSummaryCard } from "./portfolio-summary-card";

/**
 * Portfolio Details Component
 *
 * Displays comprehensive portfolio information including:
 * - Total portfolio value and summary statistics
 * - Asset breakdown by type and factory
 * - Proper empty states for users without assets
 *
 * Only shown for registered users who can receive assets.
 */
export function PortfolioDetails() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PortfolioDetailsSkeleton />}>
        <ComponentErrorBoundary componentName="Portfolio Details">
          <PortfolioDetailsContent />
        </ComponentErrorBoundary>
      </Suspense>
    </div>
  );
}

function PortfolioDetailsContent() {
  const { data: portfolioData } = useSuspenseQuery(
    orpc.system.stats.portfolioDetails.queryOptions({
      input: {},
    })
  );

  const hasAssets = portfolioData.totalTokenFactories > 0;

  return (
    <div className="space-y-6">
      <PortfolioSummaryCard
        totalValue={portfolioData.totalValue}
        totalTokenFactories={portfolioData.totalTokenFactories}
        hasAssets={hasAssets}
      />
      <PortfolioBreakdown
        breakdown={portfolioData.tokenFactoryBreakdown}
        hasAssets={hasAssets}
      />
    </div>
  );
}

function PortfolioDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Portfolio Summary Skeleton */}
      <div className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown Skeleton */}
      <div className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex h-[300px] items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
