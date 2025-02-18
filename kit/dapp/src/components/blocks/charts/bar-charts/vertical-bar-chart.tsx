'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import type { AxisConfig, BarChartData } from './types';

interface VerticalBarChartProps<T extends BarChartData> {
  data: T[];
  config: ChartConfig;
  title: string;
  description?: string;
  yAxis: AxisConfig<T>;
  valueKey: keyof T & string;
}

export function VerticalBarChartComponent<T extends BarChartData>({
  data,
  config,
  title,
  description,
  yAxis,
  valueKey,
}: VerticalBarChartProps<T>) {
  const { key, tickFormatter, tickMargin } = yAxis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 30,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey={key}
              type="category"
              tickLine={false}
              tickMargin={tickMargin}
              axisLine={false}
              tickFormatter={tickFormatter}
              hide
            />
            <XAxis dataKey={valueKey} type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey={valueKey} layout="vertical" radius={4}>
              <LabelList dataKey={key} position="insideLeft" className="fill-[--color-label]" fontSize={12} />
              <LabelList dataKey={valueKey} position="right" className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Example usage:
/*
const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

<VerticalBarChartComponent
  data={chartData}
  config={chartConfig}
  title="Bar Chart - Custom Label"
  description="January - June 2024"
  yAxis={{ key: 'month' }}
  valueKey="desktop"
  footer={{
    trend: {
      value: 5.2,
      label: 'Trending up by'
    },
    description: 'Showing total visitors for the last 6 months'
  }}
/>
*/
