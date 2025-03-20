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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface DonutProgressChartProps {
  title: string;
  description?: string;
  value: number;
  max: number;
  status: string;
  statusLabel: string;
  statusColor: string;
  className?: string;
  footer?: ReactNode;
  hideLabel?: boolean;
}

/**
 * A donut chart that shows progress as a percentage
 * Visually similar to a pie chart with a hole, but functions like a progress chart
 */
export function DonutProgressChart({
  title,
  description,
  value,
  max,
  status,
  statusLabel,
  statusColor,
  footer,
  className,
  hideLabel = true,
}: DonutProgressChartProps) {
  // Calculate percentage (cap at 100%)
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const remaining = 100 - percentage;

  // Prepare data for the donut chart
  const chartData = [
    { name: status, value: percentage },
    { name: "remaining", value: remaining }
  ];

  // Configure colors and labels
  const config: ChartConfig = {
    [status]: {
      label: statusLabel,
      color: statusColor,
    },
    remaining: {
      label: "Remaining",
      color: "var(--muted)" // Grey for the remaining portion
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full h-40 max-w-[180px] mx-auto">
            {/* Percentage label - positioned absolutely in the center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold">{percentage}%</span>
            </div>

            {/* Chart */}
            <ChartContainer className="w-full h-full" config={config}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="80%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => {
                    const color = config[entry.name]?.color;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color}
                        fillOpacity={index === 0 ? 1 : 0.15}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {!hideLabel && (
            <div className="mt-4 text-sm text-muted-foreground">
              {value.toLocaleString()} / {max.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}