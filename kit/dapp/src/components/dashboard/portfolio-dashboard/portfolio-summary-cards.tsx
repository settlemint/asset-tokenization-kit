import { PercentageChange } from "@/components/stats/percentage-change";
import { StatCard } from "@/components/stats/widgets/stat-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatValue } from "@/lib/utils/format-value/index";
import { orpc } from "@/orpc/orpc-client";
import type { FiatCurrency } from "@atk/zod/fiat-currency";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Briefcase, Shield } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AssetTypeBreakdown } from "./asset-type-breakdown";

/**
 * Total Value Card - Displays combined portfolio value with percentage change
 *
 * Why include percentage change: Provides at-a-glance trend information to help
 * users quickly assess portfolio performance without navigating to detailed views.
 *
 * Fetches current portfolio data, base currency setting, and 7-day historical data
 * to calculate and display percentage change over the trailing 7-day period.
 *
 * Data flow:
 * 1. Fetches portfolio timeseries data for trailing 7 days
 * 2. Extracts first value (7 days ago) as previous value
 * 3. Extracts last value (most recent) as current value
 * 4. Passes both values to PercentageChange component for display
 */
function TotalValueCard() {
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
   * the percentage change shown in the card and the data displayed
   * in the portfolio value interactive chart.
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
   * Edge case handling: If timeseries is empty, values will be undefined
   * and PercentageChange component will handle this gracefully by showing 0%
   */
  const timeseries = historicalData?.data ?? [];
  const previousValue = timeseries.at(0)?.totalValueInBaseCurrency ?? 0;
  const currentValue = timeseries.at(-1)?.totalValueInBaseCurrency ?? 0;

  return (
    <StatCard
      title={t("portfolioDashboard.cards.totalValue.title")}
      value={formatValue(portfolioData.totalValue, {
        type: "currency",
        currency: baseCurrency as FiatCurrency,
      })}
      description={t("portfolioDashboard.cards.totalValue.description")}
      indicator={
        <PercentageChange
          previousValue={previousValue}
          currentValue={currentValue}
          period="trailing7Days"
        />
      }
    />
  );
}

/**
 * Total Assets Card - Displays number of assets with breakdown by type
 *
 * Fetches portfolio data for asset counts and factory breakdown.
 * Shows a briefcase icon as a visual indicator to represent assets/portfolio management.
 *
 * Why display both total assets and breakdown: Provides two levels of detail -
 * the headline number (total assets held) and the composition (breakdown by type)
 * helping users quickly understand their portfolio structure.
 */
function TotalAssetsCard() {
  const { t } = useTranslation("dashboard");
  const { data: portfolioData } = useSuspenseQuery(
    orpc.system.stats.portfolioDetails.queryOptions({ input: {} })
  );

  return (
    <StatCard
      title={t("portfolioDashboard.cards.totalAssets.title")}
      value={
        <div className="space-y-1">
          <div>{portfolioData.totalAssetsHeld}</div>
        </div>
      }
      description={
        <AssetTypeBreakdown breakdown={portfolioData.tokenFactoryBreakdown} />
      }
      indicator={<Briefcase className="h-4 w-4 text-muted-foreground" />}
    />
  );
}

/**
 * Identity Status Card - Displays user's identity verification status
 *
 * Fetches identity data to determine verification state. Shows a shield icon
 * as a visual indicator to represent security and identity protection.
 */
function IdentityStatusCard() {
  const { t } = useTranslation("dashboard");
  const { data: identity } = useSuspenseQuery(
    orpc.system.identity.me.queryOptions()
  );

  const isIdentityVerified = identity.registered !== false;

  return (
    <StatCard
      title={t("portfolioDashboard.cards.identityStatus.title")}
      value={
        <div
          className={
            isIdentityVerified ? "text-success" : "text-muted-foreground"
          }
        >
          {isIdentityVerified
            ? t("portfolioDashboard.cards.identityStatus.verified")
            : t("portfolioDashboard.cards.identityStatus.pending")}
        </div>
      }
      description={t("portfolioDashboard.cards.identityStatus.description")}
      indicator={<Shield className="h-4 w-4 text-success" />}
    />
  );
}

/**
 * Skeleton for individual stat cards
 */
function StatCardSkeleton() {
  return <Skeleton className="h-[120px] w-full" />;
}

/**
 * Portfolio Summary Cards Component
 *
 * Displays three key portfolio metrics with individual Suspense boundaries:
 * 1. Total value - Combined value of all assets
 * 2. Total assets - Number of token factories
 * 3. Identity status - User's identity verification status
 *
 * Each card fetches its own data and loads independently.
 * TanStack Query automatically deduplicates identical queries.
 */
export function PortfolioSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Suspense fallback={<StatCardSkeleton />}>
        <TotalValueCard />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton />}>
        <TotalAssetsCard />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton />}>
        <IdentityStatusCard />
      </Suspense>
    </div>
  );
}

/**
 * Skeleton loader for portfolio summary cards
 * Displays three skeleton placeholders matching the card layout
 */
export function PortfolioSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}
