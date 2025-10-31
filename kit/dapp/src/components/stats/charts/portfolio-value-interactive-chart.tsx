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
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export interface PortfolioValueInteractiveChartProps {
  defaultRange?: StatsRangePreset;
}

/**
 * Portfolio Value Interactive Chart Component
 *
 * Displays historical portfolio value data for the authenticated user using an interactive chart.
 * Shows total portfolio value over time to visualize investment performance trends.
 * Supports switching between area and bar chart views.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export const PortfolioValueInteractiveChart = withErrorBoundary(
  function PortfolioValueInteractiveChart({
    defaultRange = "trailing7Days",
  }: PortfolioValueInteractiveChartProps) {
    const { t, i18n } = useTranslation("stats");
    const locale = i18n.language;
    const { data: baseCurrency } = useSuspenseQuery(
      orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
    );

    // Internal state for selected range
    const [selectedRange, setSelectedRange] =
      useState<StatsRangePreset>(defaultRange);

    // Configure chart colors and labels
    const chartConfig: ChartConfig = {
      totalValueInBaseCurrency: {
        label: t("charts.portfolioValue.label"),
        color: "var(--chart-1)",
      },
    };

    const queriesResults = useQueries({
      queries: statsRangePresets.map((preset) =>
        orpc.system.stats.portfolioByPreset.queryOptions({
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

    const dataKeys = ["totalValueInBaseCurrency"];

    return (
      <InteractiveChartComponent
        title={t("charts.portfolioValue.title")}
        description={t("charts.portfolioValue.description")}
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
          // Format Y-axis ticks with currency notation for better readability
          const numValue = Number(value);
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: baseCurrency ?? "USD",
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(numValue);
        }}
        emptyMessage={t("charts.portfolioValue.empty.title")}
        emptyDescription={t("charts.portfolioValue.empty.description")}
      />
    );
  }
);
