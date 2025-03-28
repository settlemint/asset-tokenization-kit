"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

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
import { useAssetTypeFormatter } from "@/hooks/use-asset-type-formatter";
import type { ReactNode } from "react";
import { defaultTickFormatter, defaultTickMargin } from "../tick-formatter";

export interface BarChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  assetTypeFormatter?: boolean;
  tickMargin?: number;
  angle?: number;
}

interface BarChartContainerProps {
  data: BarChartData[];
  config: ChartConfig;
  xAxis: XAxisConfig;
  className?: string;
  footer?: ReactNode;
  showYAxis?: boolean;
  showLegend?: boolean;
  colors?: string[];
  chartContainerClassName?: string;
  stacked?: boolean;
}

interface BarChartProps extends BarChartContainerProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  showYAxis?: boolean;
}

export function BarChartComponent({
  title,
  description,
  footer,
  ...chartContainerProps
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 pr-4 pb-4">
        <BarChartContainer {...chartContainerProps} />
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

export function BarChartContainer({
  data,
  config,
  xAxis,
  showYAxis,
  colors,
  chartContainerClassName,
  showLegend = true,
  stacked = true,
}: BarChartContainerProps) {
  const dataKeys = Object.keys(config);
  const {
    key,
    assetTypeFormatter = false,
    tickMargin = defaultTickMargin,
  } = xAxis;

  // Use the asset type formatter hook if requested
  const formatAssetType = useAssetTypeFormatter();

  const tickFormatter = (value: string) => {
    if (assetTypeFormatter) {
      return formatAssetType(value);
    }
    return defaultTickFormatter(value);
  };

  return (
    <ChartContainer config={config} className={chartContainerClassName}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        {showLegend && dataKeys.length > 1 && (
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
        {showYAxis && (
          <YAxis tickLine={false} axisLine={true} tickMargin={tickMargin} />
        )}
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          wrapperStyle={{ minWidth: "200px", width: "auto" }}
        />
        <defs>
          {dataKeys.map((key) => (
            <linearGradient
              key={key}
              id={`barGradient${key}`}
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
                stopOpacity={0.4}
              />
            </linearGradient>
          ))}
          {colors?.map((color, index) => (
            <linearGradient
              key={`customGradient${index}`}
              id={`customGradient${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={stacked ? "a" : undefined}
            fill={`url(#barGradient${key})`}
            stroke={config[key].color}
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
          >
            {colors?.map((color, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#customGradient${index})`}
                stroke={color}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
