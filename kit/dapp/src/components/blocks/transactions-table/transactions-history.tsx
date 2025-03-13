"use client";
import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  formatChartDate,
  formatInterval,
  type TimeSeriesOptions,
} from "@/lib/charts";
import { useTranslations } from "next-intl";

export interface TransactionsHistoryProps {
  title?: string;
  description?: string;
  from?: string;
  data: {
    timestamp: string;
    transaction: number;
  }[];
  chartOptions: Pick<
    TimeSeriesOptions,
    "intervalType" | "intervalLength" | "granularity"
  > & {
    chartContainerClassName?: string;
  };
}

export function TransactionsHistory({
  chartOptions,
  data,
  title,
  description,
}: TransactionsHistoryProps) {
  const t = useTranslations("components.transactions-history");

  const TRANSACTIONS_CHART_CONFIG = {
    transaction: {
      label: t("chart-label"),
      color: "#3B9E99",
    },
  } satisfies ChartConfig;

  return (
    <AreaChartComponent
      data={data.map((item) => ({
        ...item,
        timestamp: formatChartDate(
          new Date(item.timestamp),
          chartOptions.granularity
        ),
      }))}
      config={TRANSACTIONS_CHART_CONFIG}
      title={title ?? t("title")}
      description={
        description ??
        t("description", {
          interval: formatInterval(
            chartOptions.intervalLength,
            chartOptions.intervalType
          ),
        })
      }
      xAxis={{
        key: "timestamp",
        tickFormatter: getTickFormatter(chartOptions),
      }}
      showYAxis={true}
      chartContainerClassName={chartOptions.chartContainerClassName}
    />
  );
}

function getTickFormatter(
  chartOptions: Pick<TimeSeriesOptions, "granularity">
) {
  switch (chartOptions.granularity) {
    case "day":
      return (tick: string) => {
        return formatChartDate(new Date(tick), "day");
      };
    case "month":
      return (tick: string) => formatChartDate(new Date(tick), "month");
    case "hour":
      return (tick: string) => formatChartDate(new Date(tick), "hour");
  }
}
