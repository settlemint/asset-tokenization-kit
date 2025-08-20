import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_SETTINGS } from "@/lib/db/schemas/settings";
import { orpc } from "@/orpc/orpc-client";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "dnum";
import { useTranslation } from "react-i18next";

const logger = createLogger();

/**
 * Value Statistics Widget
 *
 * Displays the total value of all assets formatted in the system's base currency.
 * Uses the consolidated metrics endpoint for optimal performance.
 */
export function ValueStatsWidget() {
  const { t, i18n } = useTranslation("stats");

  // Fetch just the total value metrics - more efficient than fetching all metrics
  const { data: metrics } = useSuspenseQuery(
    orpc.system.statsValue.queryOptions({ input: {} })
  );

  // Get the system's base currency from settings
  const [baseCurrency] = useSettings("BASE_CURRENCY");

  // Use the system's base currency, falling back to the default if not set
  const userCurrency = baseCurrency ?? DEFAULT_SETTINGS.BASE_CURRENCY;
  const locale = i18n.language;

  // Safely parse and format the total value using dnum to preserve precision
  let formattedValue: string;
  try {
    // Use bigDecimal validator to safely parse the string value
    const totalValueBigDecimal = bigDecimal().parse(metrics.totalValue);

    // Format directly using dnum's format function to preserve precision
    // dnum handles large numbers safely without precision loss
    const formattedNumber = format(totalValueBigDecimal, {
      digits: 2,
      trailingZeros: true,
    });

    // Add currency symbol manually to avoid number conversion
    const currencySymbol =
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: userCurrency,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? userCurrency;

    formattedValue = `${currencySymbol}${formattedNumber}`;
  } catch (error) {
    // Log the error for debugging
    logger.error("Failed to format total value", {
      error,
      totalValue: metrics.totalValue,
      currency: userCurrency,
    });

    // Show a fallback value with proper currency formatting
    formattedValue = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

  return (
    <ComponentErrorBoundary componentName="Value Stats Widget">
      <Card>
        <CardHeader>
          <CardTitle>{t("widgets.value.title")}</CardTitle>
        </CardHeader>
        <CardContent className="font-bold text-3xl">
          {formattedValue}
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          {t("widgets.value.description")}
        </CardFooter>
      </Card>
    </ComponentErrorBoundary>
  );
}
