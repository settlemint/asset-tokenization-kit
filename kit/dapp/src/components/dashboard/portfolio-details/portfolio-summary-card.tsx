import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Dnum } from "dnum";
import { toNumber } from "dnum";
import { Briefcase, Building2, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PortfolioSummaryCardProps {
  totalValue: Dnum;
  totalTokenFactories: number;
  hasAssets: boolean;
}

export function PortfolioSummaryCard({
  totalValue,
  totalTokenFactories,
  hasAssets,
}: PortfolioSummaryCardProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  if (!hasAssets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t("charts.portfolio.summary.title")}
          </CardTitle>
          <CardDescription>
            {t("charts.portfolio.summary.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[120px] flex-col items-center justify-center gap-2 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("charts.portfolio.empty.summary")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedTotalValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: baseCurrency ?? "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(totalValue));

  // Calculate unique asset types from totalTokenFactories
  const assetTypes = totalTokenFactories;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {t("charts.portfolio.summary.title")}
        </CardTitle>
        <CardDescription>
          {t("charts.portfolio.summary.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {t("charts.portfolio.summary.totalValue")}
            </div>
            <div className="text-2xl font-bold">{formattedTotalValue}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {t("charts.portfolio.summary.assetFactories")}
            </div>
            <div className="text-2xl font-bold">{totalTokenFactories}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {t("charts.portfolio.summary.assetTypes")}
            </div>
            <div className="text-2xl font-bold">{assetTypes}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
