import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { safeToNumber } from "@/lib/utils/format-value/safe-to-number";
import { orpc } from "@/orpc/orpc-client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface PortfolioValueAreaChartProps {
  interval?: "hour" | "day";
  from?: string;
  to?: string;
  timeRange?: number; // days, default 30
}

/**
 * Portfolio Value Area Chart Component
 *
 * Displays historical portfolio value data for the authenticated user using an area chart.
 * Shows total portfolio value over time to visualize investment performance trends.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function PortfolioValueAreaChart({
  interval = "day",
  from,
  to,
  timeRange = 30,
}: PortfolioValueAreaChartProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        data: Array<{ timestamp: string; totalValueInBaseCurrency: string }>;
      }) => {
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
          const timestamp = new Date(Number.parseInt(item.timestamp) * 1000);
          const formattedTimestamp =
            interval === "hour"
              ? format(timestamp, "MMM dd HH:mm")
              : format(timestamp, "MMM dd");

          return {
            timestamp: formattedTimestamp,
            portfolioValue: safeToNumber(item.totalValueInBaseCurrency),
          };
        });

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
    [t, interval]
  );

  // Build the input parameters
  const input = useMemo(() => {
    const params: { interval: "hour" | "day"; from?: string; to?: string } = {
      interval,
    };

    if (from) {
      params.from = from;
    }

    if (to) {
      params.to = to;
    }

    // If no date range provided, calculate from timeRange
    if (!from && !to && timeRange) {
      const now = new Date();
      const fromDate = new Date(
        now.getTime() - timeRange * 24 * 60 * 60 * 1000
      );
      params.from = fromDate.toISOString();
      params.to = now.toISOString();
    }

    return params;
  }, [interval, from, to, timeRange]);

  // Fetch portfolio value data with optimized caching
  const { data: rawData } = useQuery(
    orpc.system.stats.portfolio.queryOptions({
      input,
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

  return (
    <ComponentErrorBoundary componentName="Portfolio Value Chart">
      <AreaChartComponent
        title={t("charts.portfolioValue.title")}
        description={t("charts.portfolioValue.description", {
          days: timeRange,
          interval,
        })}
        interval={interval}
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
