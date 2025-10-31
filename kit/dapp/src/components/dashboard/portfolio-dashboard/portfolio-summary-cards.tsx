import { StatCard } from "@/components/stats/widgets/stat-widget";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatValue } from "@/lib/utils/format-value/index";
import { orpc } from "@/orpc/orpc-client";
import type { FiatCurrency } from "@atk/zod/fiat-currency";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Briefcase, ShieldCheck, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

/**
 * Total Value Card - Displays combined portfolio value
 * Fetches portfolio data and base currency setting
 */
function TotalValueCard() {
  const { t } = useTranslation("dashboard");
  const { data: portfolioData } = useSuspenseQuery(
    orpc.system.stats.portfolioDetails.queryOptions({ input: {} })
  );
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  return (
    <StatCard
      title={t("portfolioDashboard.cards.totalValue.title")}
      value={formatValue(portfolioData.totalValue, {
        type: "currency",
        currency: baseCurrency as FiatCurrency,
      })}
      icon={TrendingUp}
    />
  );
}

/**
 * Total Assets Card - Displays number of token factories
 * Fetches portfolio data for factory count
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
          <div>{portfolioData.totalTokenFactories}</div>
        </div>
      }
      icon={Briefcase}
    />
  );
}

/**
 * Identity Status Card - Displays user's identity verification status
 * Fetches identity data to determine verification state
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
        <Badge variant={isIdentityVerified ? "default" : "outline"}>
          {isIdentityVerified
            ? t("portfolioDashboard.cards.identityStatus.verified")
            : t("portfolioDashboard.cards.identityStatus.pending")}
        </Badge>
      }
      icon={ShieldCheck}
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}
