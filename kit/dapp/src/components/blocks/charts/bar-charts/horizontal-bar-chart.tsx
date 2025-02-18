'use client';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { AxisConfig, BarChartData } from './types';

interface BarChartProps<T extends BarChartData> {
  data: T[];
  config: ChartConfig;
  title: string;
  description?: string;
  xAxis: AxisConfig<T>;
  className?: string;
}

const defaultTickFormatter = (value: string) => value.slice(0, 3);
const defaultTickMargin = 10;

export function HorizontalBarChartComponent<T extends BarChartData>({
  data,
  config,
  title,
  description,
  xAxis,
}: BarChartProps<T>) {
  const dataKeys = Object.keys(config);
  const { key, tickFormatter = defaultTickFormatter, tickMargin = defaultTickMargin } = xAxis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={key}
              tickLine={false}
              tickMargin={tickMargin}
              axisLine={false}
              tickFormatter={tickFormatter}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Bar key={key} dataKey={key} stackId="a" fill={`var(--color-${key})`} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
