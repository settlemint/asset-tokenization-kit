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
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

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
  tickFormatter?: (value: string) => string;
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
  tickFormatter,
}: AreaChartComponentProps) {
  // Simple formatter function - React Compiler will optimize this
  const legendFormatter = (value: string): string => {
    const label = config[value]?.label;
    return typeof label === "string" ? label : value;
  };

  // Show empty state if no data
  if (data.length === 0) {
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
              tickFormatter={tickFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide={!showYAxis}
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
