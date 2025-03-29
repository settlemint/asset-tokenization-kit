"use client";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { formatChartDate, type TimeSeriesOptions } from "@/lib/charts";
import { useLocale, useTranslations, type Locale } from "next-intl";
import {
  TimeSeriesChart,
  TimeSeriesRoot,
  TimeSeriesTitle,
} from "../charts/time-series";

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
  data,
  title,
  description,
  chartOptions,
}: TransactionsHistoryProps) {
  const t = useTranslations("components.transactions-history");
  const locale = useLocale();

  if (!data || data.length === 0) {
    return (
      <ChartSkeleton title={title ?? t("title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>No data</p>
        </div>
      </ChartSkeleton>
    );
  }

  const TRANSACTIONS_CHART_CONFIG = {
    transaction: {
      label: t("chart-label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <TimeSeriesRoot data={data} locale={locale}>
      <TimeSeriesTitle
        title={title ?? t("title")}
        description={description ?? t("description")}
      />
      <TimeSeriesChart
        processData={data}
        config={TRANSACTIONS_CHART_CONFIG}
        xAxis={{
          key: "timestamp",
          tickFormatter: getTickFormatter(chartOptions, locale),
        }}
        roundedBars={false}
      />
    </TimeSeriesRoot>
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
