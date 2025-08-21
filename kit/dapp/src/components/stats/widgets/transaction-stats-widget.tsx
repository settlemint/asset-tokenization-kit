import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Transaction Statistics Widget
 *
 * Displays the total number of transactions with recent activity count.
 * Shows transactions processed in the last 7 days.
 */
export function TransactionStatsWidget() {
  const { t } = useTranslation("stats");

  // Fetch just the transaction count metrics - more efficient than fetching all metrics
  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.transactionCount.queryOptions({
      input: { timeRange: 7 },
    })
  );

  return (
    <ComponentErrorBoundary componentName="Transaction Stats Widget">
      <Card>
        <CardHeader>
          <CardTitle>{t("widgets.transactions.title")}</CardTitle>
        </CardHeader>
        <CardContent className="font-bold text-3xl">
          {metrics.totalTransactions.toLocaleString()}
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          {t("widgets.transactions.description", {
            count: metrics.recentTransactions,
            days: metrics.timeRangeDays,
          })}
        </CardFooter>
      </Card>
    </ComponentErrorBoundary>
  );
}
