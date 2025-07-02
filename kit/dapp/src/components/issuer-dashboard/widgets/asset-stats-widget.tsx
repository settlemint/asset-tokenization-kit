import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Asset Statistics Widget
 * 
 * Displays the total number of tokenized assets across all factories.
 * Shows both the count and a meaningful description.
 */
export function AssetStatsWidget() {
  const { t } = useTranslation("general");
  
  // Fetch all factories to get the count of factories with tokens
  const { data: factories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({ input: {} })
  );

  // Calculate total assets by counting factories with tokens
  const totalAssets = factories.filter(factory => factory.hasTokens).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.stats.assets")}
        </CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalAssets.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          Total tokenized assets
        </p>
      </CardContent>
    </Card>
  );
} 