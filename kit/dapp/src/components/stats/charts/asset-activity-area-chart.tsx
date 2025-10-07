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

export interface AssetActivityAreaChartProps {
  defaultRange?: StatsRangePreset;
}

export function AssetActivityAreaChart({
  defaultRange = "trailing7Days",
}: AssetActivityAreaChartProps) {
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
      transferEventsCount: {
        label: t("charts.assetActivity.transferEventsLabel"),
        color: "var(--chart-1)",
      },
      mintEventsCount: {
        label: t("charts.assetActivity.mintEventsLabel"),
        color: "var(--chart-2)",
      },
      burnEventsCount: {
        label: t("charts.assetActivity.burnEventsLabel"),
        color: "var(--chart-3)",
      },
    }),
    [t]
  );

  // Query automatically refetches when selectedRange changes
  const { data: rawData } = useQuery(
    orpc.system.stats.assetActivity.queryOptions({
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

  const description = t("charts.assetActivity.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;

  const timeseries = rawData?.data ?? [];
  const dataKeys = [
    "transferEventsCount",
    "mintEventsCount",
    "burnEventsCount",
  ];

  return (
    <ComponentErrorBoundary componentName="Asset Activity Chart">
      <InteractiveChartComponent
        title={t("charts.assetActivity.title")}
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
        emptyMessage={t("charts.assetActivity.empty.title")}
        emptyDescription={t("charts.assetActivity.empty.description")}
        defaultChartType="area"
        enableChartTypeToggle={true}
        availableRangePresets={availableRangePresets}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />
    </ComponentErrorBoundary>
  );
}
