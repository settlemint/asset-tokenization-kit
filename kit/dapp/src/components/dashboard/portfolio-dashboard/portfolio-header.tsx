import { PercentageChange } from "@/components/stats/percentage-change";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatValue } from "@/lib/utils/format-value/index";
import { orpc } from "@/orpc/orpc-client";
import type { FiatCurrency } from "@atk/zod/fiat-currency";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AssetTypeBreakdown } from "./asset-type-breakdown";

/**
 * Portfolio Header Content - Displays portfolio overview with value and asset breakdown
 *
 * Why separate from wrapper: Enables Suspense boundary isolation so loading
 * states don't block other dashboard components from rendering
 *
 * Data flow:
 * 1. Fetches portfolio details for total value and factory breakdown
 * 2. Fetches base currency setting for proper value formatting
 * 3. Fetches 7-day historical data for percentage change calculation
 * 4. Combines all data into cohesive header display
 */
function PortfolioHeaderContent() {
  const { t } = useTranslation("dashboard");

  const { data: portfolioData } = useSuspenseQuery(
    orpc.system.stats.portfolioDetails.queryOptions({ input: {} })
  );

  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  /**
   * Fetch 7-day portfolio value timeseries data
   *
   * Why use the same query as the chart: Ensures consistency between
   * the percentage change shown in the header and the data displayed
   * in the portfolio value interactive chart
   */
  const { data: historicalData } = useSuspenseQuery(
    orpc.system.stats.portfolioByPreset.queryOptions({
      input: { preset: "trailing7Days" },
      ...CHART_QUERY_OPTIONS,
    })
  );

  /**
   * Extract values for percentage change calculation
   *
   * Why use first and last indices:
   * - First index (0): Oldest data point in the 7-day window (previous value)
   * - Last index: Most recent data point (current value)
   *
   * Edge case handling: If timeseries is empty, values will be 0
   * and PercentageChange component will handle this by showing 0%
   */
  const timeseries = historicalData?.data ?? [];
  const previousValue = timeseries.at(0)?.totalValueInBaseCurrency ?? 0;
  const currentValue = timeseries.at(-1)?.totalValueInBaseCurrency ?? 0;

  const totalAssets = portfolioData.totalAssetsHeld;
  const totalFactories = portfolioData.totalTokenFactories;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left section: Icon, title, value, and breakdown */}
        <div className="flex gap-3 md:gap-4">
          {/* Wallet icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            {/* Title */}
            <h2 className="text-sm text-muted-foreground">
              {t("portfolioDashboard.portfolioHeader.title")}
            </h2>

            {/* Total value with percentage change */}
            <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
              <span className="text-xl md:text-2xl font-bold">
                {formatValue(portfolioData.totalValue, {
                  type: "currency",
                  currency: baseCurrency as FiatCurrency,
                })}
              </span>
              <PercentageChange
                previousValue={previousValue}
                currentValue={currentValue}
                period="trailing7Days"
              />
            </div>

            {/* Asset breakdown */}
            <div className="text-sm text-muted-foreground">
              {totalAssets > 0 && (
                <>
                  <span>
                    {t("portfolioDashboard.portfolioHeader.assetsCount", {
                      count: totalAssets,
                    })}
                  </span>
                  {totalFactories > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <AssetTypeBreakdown
                        breakdown={portfolioData.tokenFactoryBreakdown}
                      />
                    </>
                  )}
                </>
              )}
              {totalAssets === 0 && (
                <span>{t("portfolioDashboard.portfolioHeader.noAssets")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right section: View Holdings button */}
        <Link to="/my-assets" className="w-full md:w-auto">
          <Button size="lg" className="w-full md:w-auto" variant="default">
            {t("portfolioDashboard.portfolioHeader.viewHoldings")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for portfolio header
 *
 * Why match exact dimensions: Prevents layout shift when real data loads,
 * providing smooth loading experience
 */
function PortfolioHeaderSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3 md:gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 md:h-8 w-40 md:w-48" />
            <Skeleton className="h-4 w-48 md:w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full md:w-40" />
      </div>
    </div>
  );
}

/**
 * Portfolio Header Component
 *
 * Displays comprehensive portfolio overview at the top of dashboard:
 * - Wallet icon for visual identification
 * - "My Portfolio" heading
 * - Total portfolio value with percentage change indicator
 * - Asset count and breakdown by type (e.g., "3 assets • 2 bonds, 1 deposit")
 * - "View Holdings" button linking to detailed asset list
 *
 * Uses Suspense boundary for progressive loading without blocking
 * other dashboard components
 */
export function PortfolioHeader() {
  return (
    <Suspense fallback={<PortfolioHeaderSkeleton />}>
      <PortfolioHeaderContent />
    </Suspense>
  );
}
