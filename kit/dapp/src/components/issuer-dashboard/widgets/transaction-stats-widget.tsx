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

  // Fetch metrics summary which includes transaction count
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
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
          days: metrics.recentActivityDays,
        })}
      </CardFooter>
    </Card>
  );
}
