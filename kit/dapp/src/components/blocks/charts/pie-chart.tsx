"use client";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface PieChartProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
  footer?: ReactNode;
}

export function PieChartComponent({
  title,
  description,
  data,
  config,
  dataKey,
  nameKey,
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              strokeWidth={1}
              innerRadius={25}
            >
              {data.map((entry, index) => {
                const color = config[entry[nameKey]]?.color;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={0.5}
                    stroke={color}
                  />
                );
              })}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
