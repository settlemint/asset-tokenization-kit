import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_SETTINGS } from "@/lib/db/schemas/settings";
import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toNumber } from "dnum";
import { useTranslation } from "react-i18next";

/**
 * Value Statistics Widget
 *
 * Displays the total value of all assets formatted in the system's base currency.
 * Uses the consolidated metrics endpoint for optimal performance.
 */
export function ValueStatsWidget() {
  const { t, i18n } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes total value
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Get the system's base currency from settings
  const [baseCurrency] = useSettings("BASE_CURRENCY");

  // Use the system's base currency, falling back to the default if not set
  const userCurrency = baseCurrency ?? DEFAULT_SETTINGS.BASE_CURRENCY;
  const locale = i18n.language;

  // Safely parse the total value using dnum to handle large numbers without precision loss
  let formattedValue: string;
  try {
    // Use bigDecimal validator to safely parse the string value
    const totalValueBigDecimal = bigDecimal().parse(metrics.totalValue);

    // Convert to number using dnum's toNumber function for currency formatting
    // This is safe because currency formatting typically doesn't need extreme precision
    const totalValueNumber = toNumber(totalValueBigDecimal);

    // Format the total value as currency using the system's base currency
    formattedValue = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalValueNumber);
  } catch {
    // If parsing fails, show a fallback value
    formattedValue = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

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
