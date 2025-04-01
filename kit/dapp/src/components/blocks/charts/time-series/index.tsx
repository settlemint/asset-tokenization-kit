"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type {
  DataPoint,
  TimeSeriesOptions,
  TimeSeriesResult,
} from "@/lib/charts";
import { cn } from "@/lib/utils";
import {
  BarChartIcon,
  ClockArrowDownIcon,
  Info,
  LineChartIcon,
} from "lucide-react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AreaChartContainer,
  type AreaChartContainerProps,
} from "../area-chart";

import {
  BarChartContainer,
  type BarChartContainerProps,
} from "../bar-charts/horizontal-bar-chart";
import type { AxisConfig, ChartData } from "../types";

export type ChartType = "area" | "bar";
export type TimeRange = "24h" | "7d" | "30d" | "90d";

export const TIME_RANGE_CONFIG: Record<
  TimeRange,
  Pick<TimeSeriesOptions, "intervalType" | "intervalLength" | "granularity">
> = {
  "24h": {
    granularity: "hour",
    intervalType: "day",
    intervalLength: 1,
  },
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
};

interface TimeSeriesState {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  locale: Locale;
}

const TimeSeriesContext = createContext<TimeSeriesState | null>(null);

function useTimeSeries() {
  const context = useContext(TimeSeriesContext);
  if (!context) {
    throw new Error("useTimeSeries must be used within a TimeSeriesRoot");
  }
  return context as TimeSeriesState;
}

interface TimeSeriesRootProps {
  children: ReactNode;
  locale: Locale;
  defaultTimeRange?: TimeRange;
  defaultChartType?: ChartType;
  className?: string;
}

export function TimeSeriesRoot({
  children,
  locale,
  defaultTimeRange = "30d",
  defaultChartType = "area",
  className,
}: TimeSeriesRootProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

  return (
    <TimeSeriesContext.Provider
      value={{
        timeRange,
        setTimeRange,
        chartType,
        setChartType,
        locale,
      }}
    >
      <Card className={cn(className)}>{children}</Card>
    </TimeSeriesContext.Provider>
  );
}

interface TimeSeriesTitleProps {
  title: string;
  description?: string;
  lastUpdated?: string;
}

export function TimeSeriesTitle({
  title,
  description,
  lastUpdated,
}: TimeSeriesTitleProps) {
  const t = useTranslations("components.chart");
  const { chartType, setChartType, timeRange, setTimeRange } = useTimeSeries();

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <Info
                      className="h-4 w-4 text-muted-foreground"
                      aria-label="Information"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-accent-foreground text-xs">
                    {description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[5rem]">
              <SelectValue placeholder={t("select-time-range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t("time-range.24h")}</SelectItem>
              <SelectItem value="7d">{t("time-range.7d")}</SelectItem>
              <SelectItem value="30d">{t("time-range.30d")}</SelectItem>
              <SelectItem value="90d">{t("time-range.90d")}</SelectItem>
            </SelectContent>
          </Select>

          {lastUpdated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <ClockArrowDownIcon
                      className="h-4 w-4 text-muted-foreground"
                      aria-label="Last updated"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-accent-foreground text-xs">
                    {t("last-updated-at", { lastUpdated })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChartType("area")}
            className={cn(
              "h-8 w-8 p-0",
              chartType === "area" ? "text-primary" : "text-muted-foreground"
            )}
            aria-label={t("switch-to-area-chart")}
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChartType("bar")}
            className={cn(
              "h-8 w-8 p-0",
              chartType === "bar" ? "text-primary" : "text-muted-foreground"
            )}
            aria-label={t("switch-to-bar-chart")}
          >
            <BarChartIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}

export function TimeSeriesControls({ children }: { children: ReactNode }) {
  return <div className="-mt-4 px-6 flex items-center gap-4">{children}</div>;
}

type TimeSeriesChartProps<T extends DataPoint> = {
  processData: {
    (
      rawData: T[],
      timeRange: TimeRange,
      locale: Locale
    ): TimeSeriesResult<Exclude<T, "timestamp">>[];
  };
  rawData: T[];
  config: ChartConfig;
  className?: string;
} & Omit<AreaChartContainerProps, "data" | "xAxis"> &
  Omit<BarChartContainerProps, "data" | "xAxis">;

export function TimeSeriesChart<T extends DataPoint>({
  processData,
  rawData,
  className,
  xAxis = { key: "timestamp" },
  ...chartContainerProps
}: TimeSeriesChartProps<T> & { xAxis?: AxisConfig<ChartData> }) {
  const { timeRange, chartType, locale } = useTimeSeries();

  const timeseries = useMemo(() => {
    return processData(rawData, timeRange, locale);
  }, [rawData, timeRange, processData, locale]);

  const ChartComponent =
    chartType === "area" ? AreaChartContainer : BarChartContainer;

  return (
    <CardContent className="p-0 pr-4">
      <ChartComponent
        data={timeseries}
        xAxis={{ ...xAxis, key: "timestamp" }}
        showYAxis={true}
        {...chartContainerProps}
      />
    </CardContent>
  );
}
