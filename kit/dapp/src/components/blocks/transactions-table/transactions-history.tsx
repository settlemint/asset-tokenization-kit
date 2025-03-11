"use client";
import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  createTimeSeries,
  formatInterval,
  type TimeSeriesOptions,
} from "@/lib/charts";

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
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
      chartContainerClassName={chartOptions.chartContainerClassName}
    />
  );
}
