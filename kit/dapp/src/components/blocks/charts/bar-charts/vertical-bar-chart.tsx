"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import type { AxisConfig, BarChartData, BarChartProps } from "./types";

interface VerticalBarChartProps<T extends BarChartData>
  extends BarChartProps<T> {
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
          <BarChart accessibilityLayer data={data} layout="vertical">
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              wrapperStyle={{ minWidth: "200px", width: "auto" }}
            />
            <Bar dataKey={valueKey} layout="vertical" radius={4}>
              <LabelList
                dataKey={key}
                position="insideLeft"
                className="fill-white"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
