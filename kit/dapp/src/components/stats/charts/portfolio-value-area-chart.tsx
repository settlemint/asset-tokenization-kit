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
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildChartRangeDescription } from "./chart-range-description";

export interface PortfolioValueAreaChartProps {
  defaultRange?: StatsRangePreset;
}

/**
 * Portfolio Value Area Chart Component
 *
 * Displays historical portfolio value data for the authenticated user using an area chart.
 * Shows total portfolio value over time to visualize investment performance trends.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function PortfolioValueAreaChart({
  defaultRange = "trailing7Days",
}: PortfolioValueAreaChartProps) {
  const { t, i18n } = useTranslation("stats");
  const locale = i18n.language;
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  // Internal state for selected range
  const [selectedRange, setSelectedRange] =
    useState<StatsRangePreset>(defaultRange);

  // Fetch portfolio value data with optimized caching
  const { data: rawData } = useQuery(
    orpc.system.stats.portfolio.queryOptions({
      input: selectedRange,
      ...CHART_QUERY_OPTIONS,
    })
  );

  // Configure chart colors and labels
  const chartConfig: ChartConfig = {
    totalValueInBaseCurrency: {
      label: t("charts.portfolioValue.label"),
      color: "var(--chart-1)",
    },
  };

  const fallbackRange = useMemo<StatsResolvedRange>(() => {
    return resolveStatsRange(selectedRange);
  }, [selectedRange]);

  const resolvedRange = rawData?.range ?? fallbackRange;

  const overRange = buildChartRangeDescription({
    range: resolvedRange,
    t,
  });

  const description = t("charts.portfolioValue.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;
  const chartData = rawData?.data ?? [];
  const dataKeys = ["totalValueInBaseCurrency"];

  return (
    <ComponentErrorBoundary componentName="Portfolio Value Chart">
      <InteractiveChartComponent
        title={t("charts.portfolioValue.title")}
        description={description}
        interval={chartInterval}
        data={chartData}
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
    </ComponentErrorBoundary>
  );
}
