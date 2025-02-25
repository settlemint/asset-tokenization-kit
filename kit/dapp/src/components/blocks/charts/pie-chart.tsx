'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Cell, Pie, PieChart } from 'recharts';

interface PieChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
  footer?: React.ReactNode;
}

function PieGradientDefinitions({ config }: { config: ChartConfig }) {
  return (
    <>
      {Object.entries(config).map(([key, value]) => (
        <linearGradient key={key} id={`pieGradient${key}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={value.color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={value.color} stopOpacity={0.4} />
        </linearGradient>
      ))}
    </>
  );
}

export function PieChartComponent({
  title,
  description,
  data,
  config,
  dataKey,
  nameKey,
  className,
  footer,
}: PieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <defs>
              <PieGradientDefinitions config={config} />
            </defs>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} strokeWidth={1.5}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#pieGradient${entry[nameKey]})`}
                  stroke={config[entry[nameKey]].color}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
