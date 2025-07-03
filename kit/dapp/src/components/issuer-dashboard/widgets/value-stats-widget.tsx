import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Value Statistics Widget
 *
 * Displays the total value of all assets from the metrics API.
 * Uses the consolidated metrics endpoint for optimal performance.
 */
export function ValueStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes total value
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Format the total value as currency
  const totalValueNumber = parseFloat(metrics.totalValue);
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(totalValueNumber);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("stats.totalValue")}
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <p className="text-xs text-muted-foreground">
          {t("stats.totalValueDescription")}
        </p>
      </CardContent>
    </Card>
  );
}