import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartUpdateInfo } from "./chart-update-info";

export type BarChartData = Record<string, string | number>;

export interface BarChartComponentProps {
  title: string;
  description?: string;
  data: BarChartData[];
  config: ChartConfig;
  dataKeys: string[];
  nameKey: string;
  showYAxis?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  interval?: "hour" | "day";
}

// Static bar radius configuration hoisted outside component
const BAR_RADIUS: [number, number, number, number] = [2, 2, 0, 0];

/**
 * Reusable Bar Chart Component
 *
 * A flexible bar chart component that supports:
 * - Multiple data series
 * - Stacked or grouped bars
 * - Theme-aware colors with gradients
 * - Custom tooltips and legends
 * - Responsive design
 */
export function BarChartComponent({
  title,
  description,
  data,
  config,
  dataKeys,
  nameKey,
  showYAxis = false,
  showLegend = true,
  stacked = false,
  className,
  emptyMessage,
  emptyDescription,
  interval = "hour",
}: BarChartComponentProps) {
  // Simple formatter function - React Compiler will optimize this
  const legendFormatter = (value: string): string => {
    const label = config[value]?.label;
    return typeof label === "string" ? label : value;
  };

  // Filter out data with zero values across all series
  const filteredData = useMemo(
    () => data.filter((item) => dataKeys.some((key) => Number(item[key]) > 0)),
    [data, dataKeys]
  );

  // Show empty state if no data
  if (filteredData.length === 0) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        interval={interval}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <ChartUpdateInfo interval={interval} />
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            {showLegend && dataKeys.length > 1 && (
              <Legend
                align="center"
                verticalAlign="bottom"
                formatter={legendFormatter}
              />
            )}
            <XAxis
              dataKey={nameKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            {showYAxis && (
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            )}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              {dataKeys.map((key) => (
                <linearGradient
                  key={key}
                  id={`barGradient${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.4}
                  />
                </linearGradient>
              ))}
            </defs>
            {dataKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? "stack" : undefined}
                fill={`url(#barGradient${key})`}
                radius={BAR_RADIUS}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
