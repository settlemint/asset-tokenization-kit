import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { safeToNumber } from "@/lib/utils/format-value/safe-to-number";
import { orpc } from "@/orpc/orpc-client";
import { type StatsPortfolioOutput } from "@/orpc/routes/system/stats/routes/portfolio.schema";
import {
  resolveStatsRange,
  type StatsRangeInput,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { getTimestamp } from "@atk/zod/timestamp";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { subDays, subHours } from "date-fns";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { buildChartRangeDescription } from "./chart-range-description";

export type PortfolioValueAreaChartProps = {
  range: StatsRangeInput;
};

/**
 * Portfolio Value Area Chart Component
 *
 * Displays historical portfolio value data for the authenticated user using an area chart.
 * Shows total portfolio value over time to visualize investment performance trends.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function PortfolioValueAreaChart({
  range,
}: PortfolioValueAreaChartProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () => (response: StatsPortfolioOutput) => {
      const interval = response.range.interval;

      // Handle empty data case
      if (!response.data?.length) {
        return {
          chartData: [],
          chartConfig: {
            portfolioValue: {
              label: t("charts.portfolioValue.label"),
              color: "var(--chart-1)",
            },
          },
          dataKeys: ["portfolioValue"],
        };
      }

      // Transform the response data to chart format using safe conversion
      const transformedData = response.data.map((item) => {
        const timestamp = getTimestamp(item.timestamp);
        const formattedTimestamp =
          interval === "hour"
            ? format(timestamp, "MMM dd HH:mm")
            : format(timestamp, "MMM dd");

        return {
          timestamp: formattedTimestamp,
          portfolioValue: safeToNumber(item.totalValueInBaseCurrency),
        };
      });

      if (transformedData.length === 1) {
        const timestamp = getTimestamp(response.data[0]?.timestamp);
        const backfilledTimestamp =
          interval === "hour" ? subHours(timestamp, 1) : subDays(timestamp, 1);

        transformedData.unshift({
          timestamp:
            interval === "hour"
              ? format(backfilledTimestamp, "MMM dd HH:mm")
              : format(backfilledTimestamp, "MMM dd"),
          portfolioValue: safeToNumber(
            response.data[0]?.totalValueInBaseCurrency
          ),
        });
      }

      // Configure chart colors and labels
      const config: ChartConfig = {
        portfolioValue: {
          label: t("charts.portfolioValue.label"),
          color: "var(--chart-1)",
        },
      };

      return {
        chartData: transformedData,
        chartConfig: config,
        dataKeys: ["portfolioValue"],
      };
    },
    [t]
  );

  // Fetch portfolio value data with optimized caching
  const { data: rawData } = useQuery(
    orpc.system.stats.portfolio.queryOptions({
      input: range,
      ...CHART_QUERY_OPTIONS,
    })
  );

  // Transform the data using the memoized function
  const data = useMemo(() => {
    if (!rawData) return undefined;
    return selectTransform(rawData);
  }, [rawData, selectTransform]);

  const { chartData, chartConfig, dataKeys } = data ?? {
    chartData: [],
    chartConfig: {},
    dataKeys: [],
  };

  const fallbackRange = useMemo<StatsResolvedRange>(() => {
    return resolveStatsRange(range);
  }, [range]);

  const resolvedRange = rawData?.range ?? fallbackRange;

  const overRange = buildChartRangeDescription({
    range: resolvedRange,
    t,
  });

  const description = t("charts.portfolioValue.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;

  return (
    <ComponentErrorBoundary componentName="Portfolio Value Chart">
      <AreaChartComponent
        title={t("charts.portfolioValue.title")}
        description={description}
        interval={chartInterval}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={false}
        stacked={false}
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
