import { PortfolioBreakdownTable } from "@/components/dashboard/portfolio-details/portfolio-breakdown-table";
import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <Suspense fallback={<PortfolioDetailsSkeleton />}>
        <ComponentErrorBoundary componentName={t("portfolioDetails.name")}>
          <PortfolioDetailsContent />
        </ComponentErrorBoundary>
      </Suspense>
    </div>
  );
}

function PortfolioDetailsContent() {
  const { t } = useTranslation("dashboard");
  const { data: portfolioData } = useSuspenseQuery(
    orpc.system.stats.portfolioDetails.queryOptions({
      input: {},
    })
  );

  const hasAssets = portfolioData.totalTokenFactories > 0;

  return (
    <div className="space-y-8">
      {/* Portfolio Summary Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <SectionTitle>{t("portfolioDetails.summary.title")}</SectionTitle>
          <SectionSubtitle>
            {t("portfolioDetails.summary.description")}
          </SectionSubtitle>
        </div>
        <PortfolioSummaryCard
          totalValue={portfolioData.totalValue}
          totalTokenFactories={portfolioData.totalTokenFactories}
          totalAssetsHeld={portfolioData.totalAssetsHeld}
          hasAssets={hasAssets}
        />
        <PortfolioBreakdown
          breakdown={portfolioData.tokenFactoryBreakdown}
          hasAssets={hasAssets}
        />
        <PortfolioBreakdownTable
          breakdown={portfolioData.tokenFactoryBreakdown}
        />
      </div>
    </div>
  );
}

function PortfolioDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Portfolio Summary Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Breakdown Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

      {/* Portfolio Performance Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/50 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-[300px] flex items-end justify-between gap-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-full"
                  style={{ height: `${Math.random() * 200 + 50}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
