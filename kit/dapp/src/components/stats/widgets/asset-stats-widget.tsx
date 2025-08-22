import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAssetTypePlural } from "@/lib/utils/asset-pluralization";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Asset Statistics Widget
 *
 * Displays the total number of tokenized assets with dynamic breakdown by asset type.
 * Shows counts for all asset types found in the system with proper pluralization for all languages.
 */
export function AssetStatsWidget() {
  const { t } = useTranslation("stats");
  const pluralizeAsset = useAssetTypePlural();

  // Fetch just the asset count metrics - more efficient than fetching all metrics
  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({ input: {} })
  );

  // Create dynamic breakdown text using proper i18n pluralization
  const assetBreakdownText = Object.entries(metrics.assetBreakdown)
    .filter(([, count]) => count > 0) // Only show asset types that exist
    .map(([assetType, count]) => {
      const translatedType = pluralizeAsset(assetType, count);
      return `${count} ${translatedType}`;
    })
    .join(", ");

  return (
    <ComponentErrorBoundary componentName="Asset Stats Widget">
      <Card>
        <CardHeader>
          <CardTitle>{t("widgets.assets.title")}</CardTitle>
        </CardHeader>
        <CardContent className="font-bold text-3xl">
          {metrics.totalAssets.toLocaleString()}
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          {assetBreakdownText || t("widgets.assets.empty")}
        </CardFooter>
      </Card>
    </ComponentErrorBoundary>
  );
}
