"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TimeSeriesOptions, TimeSeriesResult } from "@/lib/charts";
import { BarChartIcon, Info, LineChartIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AreaChartContainer } from "../area-chart";

import { BarChartContainer } from "../bar-charts/horizontal-bar-chart";

export type ChartType = "area" | "bar";
export type TimeRange = "7d" | "30d" | "90d" | "180d" | "1y";

export const TIME_RANGE_CONFIG: Record<
  TimeRange,
  Pick<TimeSeriesOptions, "intervalType" | "intervalLength" | "granularity">
> = {
  "7d": {
    granularity: "day",
    intervalType: "day",
    intervalLength: 7,
  },
  "30d": {
    granularity: "day",
    intervalType: "day",
    intervalLength: 30,
  },
  "90d": {
    granularity: "day",
    intervalType: "day",
    intervalLength: 90,
  },
  "180d": {
    granularity: "day",
    intervalType: "month",
    intervalLength: 6,
  },
  "1y": {
    granularity: "day",
    intervalType: "year",
    intervalLength: 1,
  },
};

interface TimeSeriesState<T> {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  data: T[];
  locale: Locale;
}

const TimeSeriesContext = createContext<TimeSeriesState<any> | null>(null);

function useTimeSeries<T>() {
  const context = useContext(TimeSeriesContext);
  if (!context) {
    throw new Error("useTimeSeries must be used within a TimeSeriesRoot");
  }
  return context as TimeSeriesState<T>;
}

interface TimeSeriesRootProps<T> {
  children: ReactNode;
  data: T[];
  locale: Locale;
  defaultTimeRange?: TimeRange;
  defaultChartType?: ChartType;
}

export function TimeSeriesRoot<T extends { timestamp: string }>({
  children,
  data,
  locale,
  defaultTimeRange = "30d",
  defaultChartType = "area",
}: TimeSeriesRootProps<T>) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

  return (
    <TimeSeriesContext.Provider
      value={{
        timeRange,
        setTimeRange,
        chartType,
        setChartType,
        data,
        locale,
      }}
    >
      <Card>{children}</Card>
    </TimeSeriesContext.Provider>
  );
}

interface TimeSeriesTitleProps {
  title: string;
  description?: string;
  tooltip?: string;
}

export function TimeSeriesTitle({
  title,
  description,
  tooltip,
}: TimeSeriesTitleProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="h-4 w-4 text-muted-foreground"
                  aria-label="Information"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-accent-foreground text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
  );
}

export function TimeSeriesControls() {
  const t = useTranslations("components.chart");
  const { timeRange, setTimeRange, chartType, setChartType } = useTimeSeries();

  return (
    <div className="flex items-center gap-4 px-6">
      {/* Chart Type Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setChartType("area")}
          className={`p-1 rounded hover:bg-accent ${
            chartType === "area" ? "text-primary" : "text-muted-foreground"
          }`}
          aria-label={t("switch-to-area-chart")}
        >
          <LineChartIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`p-1 rounded hover:bg-accent ${
            chartType === "bar" ? "text-primary" : "text-muted-foreground"
          }`}
          aria-label={t("switch-to-bar-chart")}
        >
          <BarChartIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Time Range Selector */}
      <Select
        value={timeRange}
        onValueChange={(value) => setTimeRange(value as TimeRange)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("select-time-range")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">{t("time-range.7d")}</SelectItem>
          <SelectItem value="30d">{t("time-range.30d")}</SelectItem>
          <SelectItem value="90d">{t("time-range.90d")}</SelectItem>
          <SelectItem value="180d">{t("time-range.180d")}</SelectItem>
          <SelectItem value="1y">{t("time-range.1y")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface TimeSeriesChartProps<T> {
  processData: (
    rawData: T[],
    timeRange: TimeRange,
    locale: Locale
  ) => TimeSeriesResult<T>[];
  config: ChartConfig;
  showYAxis?: boolean;
  stacked?: boolean;
  className?: string;
}

export function TimeSeriesChart<T>({
  processData,
  config,
  showYAxis = true,
  stacked = false,
  className,
}: TimeSeriesChartProps<T>) {
  const { timeRange, chartType, data, locale } = useTimeSeries<T>();

  const timeseries = useMemo(() => {
    return processData(data, timeRange, locale);
  }, [data, timeRange, processData, locale]);

  const ChartComponent =
    chartType === "area" ? AreaChartContainer : BarChartContainer;

  return (
    <CardContent className="p-0 pr-4">
      <ChartComponent
        data={timeseries}
        config={config}
        xAxis={{ key: "timestamp" }}
        showYAxis={showYAxis}
        stacked={stacked}
        chartContainerClassName={className}
      />
    </CardContent>
  );
}
