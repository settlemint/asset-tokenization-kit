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
import { PieChart as PieChartIcon } from "lucide-react";
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
  // Filter data to only show non-zero values
  const filteredData = data.filter((d) => Number(d[dataKey]) !== 0);

  if (filteredData.length === 0) {
    return (
      <Card>
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
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
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
