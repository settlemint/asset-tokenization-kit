import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import {
  resolveStatsRange,
  type StatsRangeInput,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { buildChartRangeDescription } from "./chart-range-description";

export type AssetLifecycleAreaChartProps = {
  range: StatsRangeInput;
};

export function AssetLifecycleAreaChart({
  range,
}: AssetLifecycleAreaChartProps) {
  const { t } = useTranslation("stats");

  const chartConfig: ChartConfig = useMemo(
    () => ({
      assetsCreated: {
        label: t("charts.assetLifecycle.createdLabel"),
        color: "var(--chart-1)",
      },
      assetsLaunched: {
        label: t("charts.assetLifecycle.launchedLabel"),
        color: "var(--chart-2)",
      },
    }),
    [t]
  );

  const dataKeys = useMemo(() => ["assetsCreated", "assetsLaunched"], []);

  const { data: rawData } = useQuery(
    orpc.system.stats.assetLifecycle.queryOptions({
      input: range,
      ...CHART_QUERY_OPTIONS,
    })
  );

  const chartData = useMemo(() => {
    if (!rawData || rawData.data.length === 0) {
      return [];
    }

    const interval = rawData.range.interval;

    return rawData.data.map((item) => {
      const formattedTimestamp =
        interval === "hour"
          ? format(item.timestamp, "MMM dd HH:mm")
          : format(item.timestamp, "MMM dd");

      return {
        timestamp: formattedTimestamp,
        assetsCreated: item.assetsCreatedCount,
        assetsLaunched: item.assetsLaunchedCount,
      };
    });
  }, [rawData]);

  const fallbackRange = useMemo<StatsResolvedRange>(() => {
    return resolveStatsRange(range);
  }, [range]);

  const resolvedRange = rawData?.range ?? fallbackRange;

  const overRange = buildChartRangeDescription({
    range: resolvedRange,
    t,
  });

  const description = t("charts.assetLifecycle.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;

  return (
    <ComponentErrorBoundary componentName="Asset Lifecycle Chart">
      <AreaChartComponent
        title={t("charts.assetLifecycle.title")}
        description={description}
        interval={chartInterval}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        stacked={false}
        yTickFormatter={(value: string) =>
          Number(value).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        }
        emptyMessage={t("charts.assetLifecycle.empty.title")}
        emptyDescription={t("charts.assetLifecycle.empty.description")}
      />
    </ComponentErrorBoundary>
  );
}
