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
 * Asset Statistics Widget
 *
 * Displays the total number of tokenized assets with dynamic breakdown by asset type.
 * Shows counts for all asset types found in the system dynamically.
 */
export function AssetStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset count and breakdown
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Helper function to format asset type names for display
  const formatAssetType = (assetType: string) => {
    // Convert "stable-coin" to "Stable Coins", "bond" to "Bonds", etc.
    return assetType
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") + "s";
  };

  // Create dynamic breakdown text
  const assetBreakdownText = Object.entries(metrics.assetBreakdown)
    .filter(([, count]) => count > 0) // Only show asset types that exist
    .map(([assetType, count]) => `${count} ${formatAssetType(assetType)}`)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.assets")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">
        {metrics.totalAssets.toLocaleString()}
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {assetBreakdownText || "No assets found"}
      </CardFooter>
    </Card>
  );
}
