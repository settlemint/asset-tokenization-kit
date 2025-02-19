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
        <radialGradient key={key} id={`pieGradient${key}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={value.color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={value.color} stopOpacity={0.3} />
        </radialGradient>
      ))}
      <radialGradient id="pieGradientDefault" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#888888" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#888888" stopOpacity={0.3} />
      </radialGradient>
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
