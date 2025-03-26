import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetPriceInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getPortfolioHistory } from "@/lib/queries/portfolio/portfolio-history";
import type { Address } from "viem";

interface PortfolioValueProps {
  address: Address;
}

export async function PortfolioValue({ address }: PortfolioValueProps) {
  // Get historical portfolio data
  const portfolioHistory = await getPortfolioHistory({
    address,
    days: 30,
    interval: "hour",
  });

  if (!portfolioHistory || portfolioHistory.length === 0) {
    return (
      <ChartSkeleton title="Portfolio Value" variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>No portfolio data available</p>
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

  // Create chart config for each asset
  const chartConfig: ChartConfig = {};
  uniqueAssets.forEach((assetId, index) => {
    const asset = portfolioHistory.find(
      (item) => item.asset.id === assetId
    )?.asset;
    if (asset) {
      chartConfig[assetId] = {
        label: asset.name,
        color: `var(--chart-${(index % 6) + 1})`, // Cycle through 6 chart colors
      };
    }
  });

  const timeseriesPerAsset = uniqueAssets.map((assetId) => {
    const assetHistory = portfolioHistory.filter(
      (item) => item.asset.id === assetId
    );

    const processedData = assetHistory.map((item) => ({
      timestamp: item.timestamp,
      [assetId]: item.balance * (assetPriceMap.get(item.asset.id) || 0),
    }));

    return createTimeSeries(
      processedData,
      [assetId],
      {
        granularity: "day",
        intervalType: "month",
        intervalLength: 1,
        accumulation: "max",
        aggregation: "first",
        historical: true,
      },
      "en"
    );
  });

  // Combine all time series data
  const allTimestamps = new Set<string>();
  timeseriesPerAsset.forEach((series) => {
    series.forEach((item) => allTimestamps.add(item.timestamp));
  });

  // Create merged time series
  const timeseries = Array.from(allTimestamps)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((timestamp) => {
      // Start with timestamp and zero values for all assets
      const entry = {
        timestamp,
        ...Object.fromEntries(uniqueAssets.map((id) => [id, 0])),
      };

      // Add values from each asset's time series
      timeseriesPerAsset.forEach((series) => {
        const dataPoint = series.find((item) => item.timestamp === timestamp);
        if (dataPoint) {
          Object.entries(dataPoint).forEach(([key, value]) => {
            if (key !== "timestamp") {
              entry[key] = value as number;
            }
          });
        }
      });

      return entry;
    });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title="Portfolio Value"
      description="Your portfolio value over time (based on current prices)"
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
      stacked={true}
      info={`Last updated: ${timeseries.at(-1)?.timestamp}`}
      chartContainerClassName="h-[14rem] w-full"
    />
  );
}
