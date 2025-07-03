import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Transaction Statistics Widget
 *
 * Displays the total number of transactions from the metrics API.
 * Uses the consolidated metrics endpoint for optimal performance.
 */
export function TransactionStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes transaction count
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("stats.transactions")}
        </CardTitle>
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {t("stats.transactionsDescription")}
        </p>
      </CardContent>
    </Card>
  );
}