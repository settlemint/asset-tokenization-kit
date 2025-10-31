import { InteractiveChartComponent } from "@/components/charts/interactive-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatChartDate } from "@/lib/utils/timeseries";
import { orpc } from "@/orpc/orpc-client";
import {
  resolveStatsRange,
  statsRangePresets,
  type StatsRangePreset,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export interface AssetLifecycleInteractiveChartProps {
  defaultRange?: StatsRangePreset;
}

export const AssetLifecycleInteractiveChart = withErrorBoundary(
  function AssetLifecycleInteractiveChart({
    defaultRange = "trailing7Days",
  }: AssetLifecycleInteractiveChartProps) {
    const { t, i18n } = useTranslation("stats");
    const locale = i18n.language;

    // Internal state for selected range
    const [selectedRange, setSelectedRange] =
      useState<StatsRangePreset>(defaultRange);

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

    const queriesResults = useQueries({
      queries: statsRangePresets.map((preset) =>
        orpc.system.stats.assetLifecycleByPreset.queryOptions({
          input: { preset },
          ...CHART_QUERY_OPTIONS,
        })
      ),
    });

    // Map results to presets to avoid positional coupling
    const dataByPreset = new Map(
      statsRangePresets.map((preset, index) => [preset, queriesResults[index]])
    );

    const rawData = dataByPreset.get(selectedRange)?.data;

    const fallbackRange = useMemo<StatsResolvedRange>(() => {
      return resolveStatsRange(selectedRange);
    }, [selectedRange]);

    const resolvedRange = rawData?.range ?? fallbackRange;

    const chartInterval = resolvedRange.interval;

    const timeseries = rawData?.data ?? [];
    const dataKeys = ["assetsCreated", "assetsLaunched"];

    return (
      <InteractiveChartComponent
        title={t("charts.assetLifecycle.title")}
        description={t("charts.assetLifecycle.description")}
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
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />
    );
  }
);
