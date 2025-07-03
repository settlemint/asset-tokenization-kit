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
 * Value Statistics Widget
 *
 * Displays the total value of all assets formatted in the user's preferred currency.
 * Uses the consolidated metrics endpoint for optimal performance.
 */
export function ValueStatsWidget() {
  const { t, i18n } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes total value
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // TODO: Get user's preferred currency from user profile
  // For now, use EUR to match the screenshot
  const userCurrency = "EUR";
  const locale = i18n.language;

  // Format the total value as currency using user's preferred currency
  const totalValueNumber = parseFloat(metrics.totalValue);
  const formattedValue = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: userCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalValueNumber);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.totalValue")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{formattedValue}</CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.totalValueDescription")}
      </CardFooter>
    </Card>
  );
}
