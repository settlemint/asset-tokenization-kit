"use client";

import { ChartPieIcon } from "@/components/ui/animated-icons/chart-pie";
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
import { ChartSkeleton } from "./chart-skeleton";

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
  if (data.filter((d) => d.percentage !== 0).length === 0) {
    return (
      <ChartSkeleton title={title} description={description} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartPieIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      </ChartSkeleton>
    );
  }

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
              content={<ChartTooltipContent />}
              wrapperStyle={{ minWidth: "200px", width: "auto" }}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              strokeWidth={1}
              innerRadius={15}
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
              className="-translate-y-2 flex flex-wrap gap-3 *:whitespace-nowrap *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
