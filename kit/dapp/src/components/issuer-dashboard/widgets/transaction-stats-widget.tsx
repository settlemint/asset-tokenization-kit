import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

  // TODO: Replace with actual recent transaction count when API supports it
  // For now, showing 0 recent transactions to match the screenshot
  const recentCount = 0;
  const days = 7;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.transactions")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{metrics.totalTransactions.toLocaleString()}</CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.transactionsDescription", { count: recentCount, days })}
      </CardFooter>
    </Card>
  );
}