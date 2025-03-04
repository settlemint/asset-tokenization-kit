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

export interface BarChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  assetTypeFormatter?: boolean;
  tickMargin?: number;
  angle?: number;
}

interface BarChartProps {
  data: BarChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  xAxis: XAxisConfig;
  className?: string;
  footer?: ReactNode;
  showYAxis?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

const defaultTickFormatter = (value: string) => {
  if (!value) {
    return "";
  }
  // Try comma split first
  const commaSplit = value.split(",")[0];
  if (commaSplit !== value) {
    return commaSplit;
  }

  // Try lowercase
  return value.toLowerCase();
};
const defaultTickMargin = 8;

export function BarChartComponent({
  data,
  config,
  title,
  description,
  xAxis,
  footer,
  showYAxis,
  showLegend = true,
  colors,
}: BarChartProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 pr-4 pb-4">
        <ChartContainer config={config}>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
                stackId="a"
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
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
