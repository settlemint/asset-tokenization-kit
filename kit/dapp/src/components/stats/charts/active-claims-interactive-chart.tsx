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

export interface ActiveClaimsInteractiveChartProps {
  defaultRange?: StatsRangePreset;
}

export const ActiveClaimsInteractiveChart = withErrorBoundary(
  function ActiveClaimsInteractiveChart({
    defaultRange = "trailing7Days",
  }: ActiveClaimsInteractiveChartProps) {
    const { t, i18n } = useTranslation("stats");
    const locale = i18n.language;

    const [selectedRange, setSelectedRange] =
      useState<StatsRangePreset>(defaultRange);

    const chartConfig: ChartConfig = {
      totalActiveClaims: {
        label: t("charts.activeClaims.label"),
        color: "var(--chart-1)",
      },
    };

    const [trailing24HrRangeData, trailing7DaysRangeData] = useQueries({
      queries: statsRangePresets.map((preset) =>
        orpc.system.stats.claimsStats.queryOptions({
          input: preset,
          ...CHART_QUERY_OPTIONS,
        })
      ),
    });

    const rawData =
      selectedRange === "trailing24Hours"
        ? trailing24HrRangeData?.data
        : trailing7DaysRangeData?.data;

    const fallbackRange = useMemo<StatsResolvedRange>(() => {
      return resolveStatsRange(selectedRange);
    }, [selectedRange]);

    const resolvedRange = rawData?.range ?? fallbackRange;

    const chartInterval = resolvedRange.interval;

    const timeseries = rawData?.data ?? [];

    const dataKeys = ["totalActiveClaims"];

    return (
      <InteractiveChartComponent
        title={t("charts.activeClaims.title")}
        description={t("charts.activeClaims.description")}
        interval={chartInterval}
        data={timeseries}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={false}
        stacked={false}
        defaultChartType="area"
        enableChartTypeToggle={true}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        xTickFormatter={(value: string | Date | number) =>
          formatChartDate(value, chartInterval, locale)
        }
        yTickFormatter={(value: string) => {
          const numValue = Number(value);
          return numValue.toLocaleString(locale, {
            maximumFractionDigits: 0,
          });
        }}
        emptyMessage={t("charts.activeClaims.empty.title")}
        emptyDescription={t("charts.activeClaims.empty.description")}
      />
    );
  }
);
