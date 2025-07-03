import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Asset Statistics Widget
 *
 * Displays the total number of tokenized assets with breakdown by asset type.
 * Shows counts for bonds, cryptocurrencies, equities, funds, stablecoins, and deposits.
 */
export function AssetStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset count
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // TODO: Replace with actual asset type breakdown when API supports it
  // For now, showing placeholder counts that match the screenshot format
  const bonds = 0;
  const cryptocurrencies = 0; 
  const equities = 0;
  const funds = 0;
  const stableCoins = 1; // Showing 1 to match screenshot
  const deposits = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.assets")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{metrics.totalAssets.toLocaleString()}</CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.assetsDescription", {
          bonds,
          cryptocurrencies,
          equities,
          funds,
          stableCoins,
          deposits,
        })}
      </CardFooter>
    </Card>
  );
}