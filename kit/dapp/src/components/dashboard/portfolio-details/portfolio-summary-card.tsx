import { formatValue } from "@/lib/utils/format-value/index";
import { orpc } from "@/orpc/orpc-client";
import type { FiatCurrency } from "@atk/zod/fiat-currency";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type Dnum } from "dnum";
import { Briefcase, Building2, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/stats/widgets/stat-widget";

interface PortfolioSummaryCardProps {
  totalValue: Dnum;
  totalTokenFactories: number;
  totalAssetsHeld: number;
  hasAssets: boolean;
}

export function PortfolioSummaryCard({
  totalValue,
  totalTokenFactories,
  totalAssetsHeld,
  hasAssets,
}: PortfolioSummaryCardProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  if (!hasAssets) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Your portfolio summary will appear here once you receive your first asset"
        description="Start building your portfolio by receiving tokens or assets from issuers"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        title={t("charts.portfolio.summary.totalValue")}
        value={formatValue(totalValue, {
          type: "currency",
          currency: baseCurrency as FiatCurrency,
        })}
        icon={TrendingUp}
      />
      <StatCard
        title={t("charts.portfolio.summary.assetFactories")}
        value={totalTokenFactories}
        icon={Building2}
      />
      <StatCard
        title={t("charts.portfolio.summary.totalAssets")}
        value={totalAssetsHeld}
        icon={Briefcase}
      />
    </div>
  );
}
