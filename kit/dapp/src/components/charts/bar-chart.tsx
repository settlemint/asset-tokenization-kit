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
import { PieChart as PieChartIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

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
}

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
}: BarChartComponentProps) {
  const legendFormatter = useCallback(
    (value: string): string => {
      const label = config[value]?.label;
      return typeof label === "string" ? label : value;
    },
    [config]
  );

  // Filter out data with zero values across all series
  const filteredData = useMemo(
    () => data.filter((item) => dataKeys.some((key) => Number(item[key]) > 0)),
    [data, dataKeys]
  );

  const barRadius = useMemo(
    () => [2, 2, 0, 0] as [number, number, number, number],
    []
  );

  // Show empty state if no data
  if (filteredData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
            <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No data available
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
                radius={barRadius}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
