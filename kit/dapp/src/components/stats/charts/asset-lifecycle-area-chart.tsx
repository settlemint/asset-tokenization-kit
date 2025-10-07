import { InteractiveChartComponent } from "@/components/charts/interactive-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatChartDate } from "@/lib/utils/timeseries";
import { orpc } from "@/orpc/orpc-client";
import {
  resolveStatsRange,
  type StatsRangePreset,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { buildChartRangeDescription } from "./chart-range-description";

export interface AssetLifecycleAreaChartProps {
  defaultRange?: StatsRangePreset;
}

export function AssetLifecycleAreaChart({
  defaultRange = "trailing7Days",
}: AssetLifecycleAreaChartProps) {
  const { t, i18n } = useTranslation("stats");
  const locale = i18n.language;

  // Internal state for selected range
  const [selectedRange, setSelectedRange] =
    useState<StatsRangePreset>(defaultRange);

  // Available timeframe presets
  const availableRangePresets: StatsRangePreset[] = [
    "trailing24Hours",
    "trailing7Days",
  ];

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

  // Query automatically refetches when selectedRange changes
  const { data: rawData } = useQuery(
    orpc.system.stats.assetLifecycle.queryOptions({
      input: selectedRange,
      ...CHART_QUERY_OPTIONS,
    })
  );

  const fallbackRange = useMemo<StatsResolvedRange>(() => {
    return resolveStatsRange(selectedRange);
  }, [selectedRange]);

  const resolvedRange = rawData?.range ?? fallbackRange;

  const overRange = buildChartRangeDescription({
    range: resolvedRange,
    t,
  });

  const description = t("charts.assetLifecycle.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;

  const timeseries = rawData?.data ?? [];
  const dataKeys = ["assetsCreated", "assetsLaunched"];

  return (
    <ComponentErrorBoundary componentName="Asset Lifecycle Chart">
      <InteractiveChartComponent
        title={t("charts.assetLifecycle.title")}
        description={description}
        interval={chartInterval}
        data={timeseries}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        stacked={false}
        xTickFormatter={(value: string | Date | number) =>
          formatChartDate(value, chartInterval, locale)
        }
        yTickFormatter={(value: string) =>
          Number(value).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        }
        emptyMessage={t("charts.assetLifecycle.empty.title")}
        emptyDescription={t("charts.assetLifecycle.empty.description")}
        defaultChartType="area"
        enableChartTypeToggle={true}
        availableRangePresets={availableRangePresets}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />
    </ComponentErrorBoundary>
  );
}
