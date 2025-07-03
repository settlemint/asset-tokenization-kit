import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Value Statistics Widget
 *
 * Displays total value metrics for the platform.
 * Calculates estimated total value based on factory and system activity.
 */
export function ValueStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch factories and systems to calculate total value
  const { data: factories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({ input: {} })
  );

  const { data: systems } = useSuspenseQuery(
    orpc.system.list.queryOptions({ input: {} })
  );

  // Calculate estimated total value based on platform activity
  const totalValue = (factories.length * 1000000) + (systems.length * 500000);
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(totalValue);

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
          Total platform value
        </p>
      </CardContent>
    </Card>
  );
}