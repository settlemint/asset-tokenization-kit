import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Transaction Statistics Widget
 *
 * Displays the total number of transactions with recent activity count.
 * Shows transactions processed in the last 7 days.
 */
export function TransactionStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch just the transaction metrics - more efficient than fetching all metrics
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.transactions.queryOptions({ input: { timeRange: 7 } })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.transactions")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">
        {metrics.totalTransactions.toLocaleString()}
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.transactionsDescription", {
          count: metrics.recentTransactions,
          days: metrics.timeRangeDays,
        })}
      </CardFooter>
    </Card>
  );
}
