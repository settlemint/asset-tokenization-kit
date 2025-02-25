'use client';

// const ASSET_PIE_CHART_CONFIG = Object.fromEntries(
//   Object.entries(assetConfig).map(([, asset]) => [
//     asset.pluralName,
//     { label: asset.pluralName, color: asset.color },
//   ])
// ) satisfies ChartConfig;

export function AssetsSupply() {
  // const { data } = useSuspenseQuery({
  //   queryKey: queryKey,
  //   queryFn: getAssetsWidgetData,
  // });
  // const chartData = data.breakdown
  //   .filter((item) => item.supplyPercentage > 0)
  //   .map((item) => ({
  //     ...item,
  //     fill: ASSET_PIE_CHART_CONFIG[item.type].color,
  //   }));
  // if (chartData.length === 0) {
  //   return <ChartSkeleton title="Distribution" variant="noData" />;
  // }
  // return (
  //   <PieChartComponent
  //     description="Showing the distribution of assets (in %)"
  //     title="Distribution"
  //     data={chartData}
  //     dataKey="supplyPercentage"
  //     nameKey="type"
  //     config={ASSET_PIE_CHART_CONFIG}
  //   />
  // );

  return <div>To Be Moved To The Graph</div>;
}
