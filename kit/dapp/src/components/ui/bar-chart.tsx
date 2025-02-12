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

export interface BarChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
}

interface BarChartProps {
  data: BarChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  xAxis: XAxisConfig;
  className?: string;
}

const defaultTickFormatter = (value: string) => value.slice(0, 3);
const defaultTickMargin = 10;

export function BarChartComponent({ data, config, title, description, xAxis, className }: BarChartProps) {
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
