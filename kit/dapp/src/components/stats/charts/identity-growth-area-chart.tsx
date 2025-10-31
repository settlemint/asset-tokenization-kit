import { InteractiveChartComponent } from "@/components/charts/interactive-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatNumber } from "@/lib/utils/format-value/format-number";
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
import { buildChartRangeDescription } from "./chart-range-description";

export interface IdentityGrowthAreaChartProps {
  defaultRange?: StatsRangePreset;
}

export const IdentityGrowthAreaChart = withErrorBoundary(
  function IdentityGrowthAreaChart({
    defaultRange = "trailing7Days",
  }: IdentityGrowthAreaChartProps) {
    const { t, i18n } = useTranslation("stats");
    const locale = i18n.language;

    const [selectedRange, setSelectedRange] =
      useState<StatsRangePreset>(defaultRange);

    const chartConfig: ChartConfig = useMemo(
      () => ({
        activeUserIdentitiesCount: {
          label: t("charts.identityGrowth.label"),
          color: "var(--chart-1)",
        },
      }),
      [t]
    );

    const queriesResults = useQueries({
      queries: statsRangePresets.map((preset) =>
        orpc.system.stats.identityStatsOverTimeByPreset.queryOptions({
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

    const timeseries = rawData?.identityStats ?? [];

    const overRange = buildChartRangeDescription({
      range: resolvedRange,
      t,
    });

    const description = t("charts.identityGrowth.description", {
      overRange,
    });

    const dataKeys = ["activeUserIdentitiesCount"];

    return (
      <InteractiveChartComponent
        title={t("charts.identityGrowth.title")}
        description={description}
        interval={chartInterval}
        data={timeseries}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        showYAxis
        stacked={false}
        defaultChartType="area"
        enableChartTypeToggle={true}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        xTickFormatter={(value: string | Date | number) =>
          formatChartDate(value, chartInterval, locale)
        }
        yTickFormatter={(value: string) =>
          formatNumber(
            value,
            {
              type: "number",
            },
            locale
          )
        }
        emptyMessage={t("charts.identityGrowth.empty.title")}
        emptyDescription={t("charts.identityGrowth.empty.description")}
      />
    );
  }
);
