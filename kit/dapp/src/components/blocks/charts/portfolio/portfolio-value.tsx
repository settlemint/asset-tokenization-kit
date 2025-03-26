import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import { getAssetPriceInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getPortfolioHistory } from "@/lib/queries/portfolio/portfolio-history";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { PortfolioValueClient } from "./portfolio-value-client";

interface PortfolioValueProps {
  address: Address;
}

export async function PortfolioValue({ address }: PortfolioValueProps) {
  // Get historical portfolio data
  const portfolioHistory = await getPortfolioHistory({
    address,
    days: 30,
  });
  const t = await getTranslations("components.charts.portfolio");

  if (!portfolioHistory || portfolioHistory.length === 0) {
    return (
      <ChartSkeleton title="Portfolio Value" variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("portfolio-value-no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  // Get unique assets from the history
  const uniqueAssets = Array.from(
    new Set(portfolioHistory.map((item) => item.asset.id))
  );

  // Get current prices for each asset
  const assetPrices = await Promise.all(
    uniqueAssets.map((assetId) => getAssetPriceInUserCurrency(assetId))
  );

  // Create a map of asset prices
  const assetPriceMap = new Map<string, number>();
  uniqueAssets.forEach((assetId, index) => {
    assetPriceMap.set(assetId, assetPrices[index].amount);
  });

  return (
    <PortfolioValueClient
      portfolioHistory={portfolioHistory.map((item) => ({
        timestamp: item.timestamp,
        balance: item.balance,
        asset: {
          id: item.asset.id,
          name: item.asset.name,
          type: item.asset.type,
        },
      }))}
      assetPriceMap={assetPriceMap}
    />
  );
}
