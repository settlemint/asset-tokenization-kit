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
import { ReactNode, useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartUpdateInfo } from "./chart-update-info";

interface PieChartProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
  footer?: ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  interval?: "hour" | "day";
}

export function PieChartComponent({
  title,
  description,
  data,
  config,
  dataKey,
  nameKey,
  footer,
  className,
  emptyMessage,
  emptyDescription,
  interval,
}: PieChartProps) {
  // Filter data to only show non-zero values
  const filteredData = useMemo(
    () => data.filter((d) => Number(d[dataKey]) !== 0),
    [data, dataKey]
  );

  if (filteredData.length === 0) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        footer={footer}
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
          {interval && <ChartUpdateInfo interval={interval} />}
        </div>
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
              data={filteredData}
              dataKey={dataKey}
              nameKey={nameKey}
              strokeWidth={1}
              innerRadius={15}
            >
              {filteredData.map((entry, index) => {
                const itemKey = String(entry[nameKey]);
                const color = config[itemKey]?.color;
                return (
                  <Cell
                    key={`cell-${String(index)}`}
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
