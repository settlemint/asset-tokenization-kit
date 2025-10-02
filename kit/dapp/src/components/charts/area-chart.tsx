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
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartUpdateInfo } from "./chart-update-info";

export type AreaChartData = Record<string, string | number>;

export interface AreaChartComponentProps {
  title: string;
  description?: string;
  data: AreaChartData[];
  config: ChartConfig;
  dataKeys: string[];
  nameKey: string;
  showYAxis?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
  chartContainerClassName?: string;
  xTickFormatter?: (value: string | Date) => string;
  yTickFormatter?: (value: string) => string;
  emptyMessage?: string;
  emptyDescription?: string;
  interval?: "hour" | "day";
}

/**
 * Reusable Area Chart Component
 *
 * A flexible area chart component that supports:
 * - Multiple data series
 * - Stacked or overlapping areas
 * - Theme-aware colors with gradients
 * - Custom tooltips and legends
 * - Time series data visualization
 * - Responsive design
 */
export function AreaChartComponent({
  title,
  description,
  data,
  config,
  dataKeys,
  nameKey,
  showYAxis = true,
  showLegend = true,
  stacked = false,
  className,
  chartContainerClassName,
  xTickFormatter,
  yTickFormatter,
  emptyMessage,
  emptyDescription,
  interval,
}: AreaChartComponentProps) {
  // Simple formatter function - React Compiler will optimize this
  const legendFormatter = (value: string): string => {
    const label = config[value]?.label;
    return typeof label === "string" ? label : value;
  };

  // Show empty state if no data
  if (data.length === 0) {
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
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {interval && <ChartUpdateInfo interval={interval} />}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center">
        <ChartContainer
          className={cn(
            "aspect-auto w-full h-[240px] lg:h-[280px]",
            chartContainerClassName
          )}
          config={config}
        >
          <AreaChart accessibilityLayer data={data}>
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
              tickFormatter={xTickFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide={!showYAxis}
              tickFormatter={yTickFormatter}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              {dataKeys.map((key) => (
                <linearGradient
                  key={key}
                  id={`areaGradient${key}`}
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
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            {dataKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={`url(#areaGradient${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                stackId={stacked ? "stack" : key}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
