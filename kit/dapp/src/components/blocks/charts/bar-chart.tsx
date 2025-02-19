'use client';

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ReactNode } from 'react';

export interface BarChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  tickFormatter?: (value: string) => string;
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
}

const defaultTickFormatter = (value: string) => {
  if (!value) return '';
  // Try comma split first
  const commaSplit = value.split(',')[0];
  if (commaSplit !== value) return commaSplit;
  // If no comma, truncate to first 3 chars
  return value.slice(0, 3);
};
const defaultTickMargin = 8;

export function BarChartComponent({ data, config, title, description, xAxis, footer, showYAxis }: BarChartProps) {
  const dataKeys = Object.keys(config);
  const { key, tickFormatter = defaultTickFormatter, tickMargin = defaultTickMargin } = xAxis;

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
            {dataKeys.length > 1 && (
              <Legend align="center" verticalAlign="bottom" formatter={(value) => config[value].label} />
            )}
            <XAxis
              dataKey={key}
              tickLine={false}
              axisLine={false}
              tickMargin={tickMargin}
              tickFormatter={tickFormatter}
            />
            {showYAxis && <YAxis tickLine={false} axisLine={true} tickMargin={tickMargin} />}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={`barGradient${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config[key].color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={config[key].color} stopOpacity={0.8} />
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
                strokeWidth={1.5}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
