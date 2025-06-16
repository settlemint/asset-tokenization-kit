"use client";
import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { formatChartDate, type TimeSeriesOptions } from "@/lib/charts";
import { useLocale, useTranslations, type Locale } from "next-intl";

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
  const locale = useLocale();

  const TRANSACTIONS_CHART_CONFIG = {
    transaction: {
      label: t("chart-label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <AreaChartComponent
      data={data}
      config={TRANSACTIONS_CHART_CONFIG}
      title={title ?? t("title")}
      description={description ?? t("description")}
      xAxis={{
        key: "timestamp",
        tickFormatter: getTickFormatter(chartOptions, locale),
      }}
      showYAxis={true}
      chartContainerClassName={chartOptions.chartContainerClassName}
    />
  );
}

function getTickFormatter(
  chartOptions: Pick<TimeSeriesOptions, "granularity">,
  locale: Locale
) {
  switch (chartOptions.granularity) {
    case "day":
      return (tick: string) => {
        return formatChartDate(new Date(tick), "day", locale);
      };
    case "month":
      return (tick: string) => formatChartDate(new Date(tick), "month", locale);
    case "hour":
      return (tick: string) => formatChartDate(new Date(tick), "hour", locale);
    default:
      throw new Error("Invalid granularity");
  }
}
