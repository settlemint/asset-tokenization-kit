'use client';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ReactNode } from 'react';

export interface AreaChartData {
  [key: string]: string | number;
}

interface XAxisConfig {
  key: string;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  xAxis: XAxisConfig;
  className?: string;
  footer?: ReactNode;
}

const defaultTickFormatter = (value: string) => value.slice(0, 3);
const defaultTickMargin = 8;

export function AreaChartComponent({
  data,
  config,
  title,
  description,
  xAxis,
  footer,
}: AreaChartProps) {
  const dataKeys = Object.keys(config);
  const {
    key,
    tickFormatter = defaultTickFormatter,
    tickMargin = defaultTickMargin,
  } = xAxis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 16, right: 16, top: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={key}
              tickLine={false}
              axisLine={false}
              tickMargin={tickMargin}
              tickFormatter={tickFormatter}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
