"use client";
import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  createTimeSeries,
  formatInterval,
  type TimeSeriesOptions,
} from "@/lib/charts";
import { formatDate } from "../../../lib/utils/date";

export interface TransactionsHistoryProps {
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

export const TRANSACTIONS_CHART_CONFIG = {
  transaction: {
    label: "Transactions",
    color: "#3B9E99",
  },
} satisfies ChartConfig;

export function TransactionsHistory({
  chartOptions,
  data,
}: TransactionsHistoryProps) {
  return (
    <AreaChartComponent
      data={createTimeSeries(data, ["transaction"], {
        ...chartOptions,
        aggregation: "count",
      })}
      config={TRANSACTIONS_CHART_CONFIG}
      title="Transactions"
      description={`Showing transactions over the last ${formatInterval(chartOptions.intervalLength, chartOptions.intervalType)}`}
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
        return formatDate(new Date(tick), { formatStr: "MMM d" });
      };
    case "month":
      return (tick: string) => formatDate(new Date(tick), { formatStr: "MMM" });
    case "hour":
      return (tick: string) =>
        formatDate(new Date(tick), { formatStr: "MMM d, HH:mm" });
  }
}
