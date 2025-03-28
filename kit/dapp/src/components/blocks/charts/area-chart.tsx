"use client";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { defaultTickFormatter, defaultTickMargin } from "./tick-formatter";

export interface AreaChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
  angle?: number;
}

export interface AreaChartContainerProps {
  data: AreaChartData[];
  config: ChartConfig;
  xAxis: XAxisConfig;
  showYAxis?: boolean;
  stacked?: boolean;
  chartContainerClassName?: string;
}

interface AreaChartProps extends AreaChartContainerProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  info?: string;
}

export function AreaChartComponent({
  title,
  description,
  footer,
  info,
  ...chartContainerProps
}: AreaChartProps) {
  const t = useTranslations("components.chart");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-4">
            {info && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="size-4 text-muted-foreground"
                      aria-label={t("info-icon-label")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-accent-foreground text-xs">{info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 pr-4">
        <AreaChartContainer {...chartContainerProps} />
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

export function AreaChartContainer({
  data,
  config,
  xAxis,
  showYAxis,
  stacked,
  chartContainerClassName,
}: AreaChartContainerProps) {
  const dataKeys = Object.keys(config);
  const {
    key,
    tickFormatter = defaultTickFormatter,
    tickMargin = defaultTickMargin,
  } = xAxis;

  return (
    <ChartContainer config={config} className={chartContainerClassName}>
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        {dataKeys.length > 1 && (
          <Legend
            align="center"
            verticalAlign="bottom"
            formatter={(value) => config[value].label}
          />
        )}
        <XAxis
          dataKey={key}
          tickLine={false}
          axisLine={false}
          tickMargin={tickMargin}
          tickFormatter={tickFormatter}
        />
        <YAxis
          tickLine={false}
          axisLine={true}
          tickMargin={tickMargin}
          hide={!showYAxis}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          wrapperStyle={{ minWidth: "200px", width: "auto" }}
        />
        <defs>
          {dataKeys.map((key) => (
            <linearGradient
              key={key}
              id={`fill${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={config[key].color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={config[key].color}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        {dataKeys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="bump"
            fill={`url(#fill${key})`}
            fillOpacity={0.4}
            stroke={config[key].color}
            strokeWidth={2}
            stackId={stacked ? "a" : key}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
