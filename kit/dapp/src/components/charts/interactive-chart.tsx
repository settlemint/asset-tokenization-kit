import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { statsRangePresets, type StatsRangePreset } from "@atk/zod/stats-range";
import { AreaChart as AreaChartIcon, BarChart3 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmptyState } from "./chart-empty-state";

export type InteractiveChartData = Record<string, string | number | Date>;

export interface InteractiveChartProps {
  // Data & config
  title: string;
  description?: string;
  data: InteractiveChartData[];
  config: ChartConfig;
  dataKeys: string[];
  nameKey: string;

  // Chart styling
  showYAxis?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
  chartContainerClassName?: string;

  // Formatters
  xTickFormatter?: (value: string | Date | number) => string;
  yTickFormatter?: (value: string) => string;

  // Empty state
  emptyMessage?: string;
  emptyDescription?: string;
  interval?: "hour" | "day";

  // Chart type control
  defaultChartType?: "area" | "bar";
  enableChartTypeToggle?: boolean;

  // Timeframe control (controlled)
  selectedRange: StatsRangePreset;
  onRangeChange: (range: StatsRangePreset) => void;
}

// Static bar radius configuration
const BAR_RADIUS: [number, number, number, number] = [2, 2, 0, 0];

/**
 * Interactive Chart Component
 *
 * A flexible chart component that supports:
 * - Both area and bar chart types with smooth switching
 * - Timeframe selection via dropdown
 * - Multiple data series
 * - Stacked or overlapping visualization
 * - Theme-aware colors with gradients
 * - Custom tooltips and legends
 * - Responsive design
 *
 * Maintains a stable component tree for smooth transitions when switching chart types.
 * Only the recharts component swaps, while Card/ChartContainer remain mounted.
 */
export function InteractiveChartComponent({
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
  defaultChartType = "area",
  enableChartTypeToggle = true,
  selectedRange,
  onRangeChange,
}: InteractiveChartProps) {
  const { t } = useTranslation("common");

  // Chart type state (internal)
  const [chartType, setChartType] = useState<"area" | "bar">(defaultChartType);

  // Legend formatter (memoized)
  const legendFormatter = useCallback(
    (value: string): string => {
      const label = config[value]?.label;
      return typeof label === "string" ? label : value;
    },
    [config]
  );

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

  // Common props for both chart types
  const commonChartProps = {
    data,
    accessibilityLayer: true,
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex-1">{title}</CardTitle>

            <div className="items-center gap-2 sm:flex hidden">
              {/* Chart Type Toggle */}
              {enableChartTypeToggle && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setChartType("bar");
                    }}
                    className={cn("h-8 w-8", chartType === "bar" && "bg-muted")}
                    aria-label="Bar chart"
                    aria-pressed={chartType === "bar"}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setChartType("area");
                    }}
                    className={cn(
                      "h-8 w-8",
                      chartType === "area" && "bg-muted"
                    )}
                    aria-label="Area chart"
                    aria-pressed={chartType === "area"}
                  >
                    <AreaChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Timeframe Dropdown */}
              <Select value={selectedRange} onValueChange={onRangeChange}>
                <SelectTrigger
                  size="sm"
                  className="w-[140px] rounded-lg sm:ml-auto"
                  aria-label="Select timeframe"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {statsRangePresets.map((preset) => (
                    <SelectItem
                      key={preset}
                      value={preset}
                      className="rounded-lg"
                    >
                      {t(`timeframes.${preset}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 items-center">
        {/* ChartContainer stays mounted - stable tree */}
        <ChartContainer
          className={cn(
            "aspect-auto w-full h-[240px] lg:h-[280px]",
            chartContainerClassName
          )}
          config={config}
        >
          {/* Only swap recharts component - recharts handles animation */}
          {chartType === "area" ? (
            <AreaChart key="area" {...commonChartProps}>
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
          ) : (
            <BarChart key="bar" {...commonChartProps}>
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
              {showYAxis && (
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={yTickFormatter}
                />
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
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
