import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

interface AssetBreakdownDonutProps {
  data: Array<{
    assetType: string;
    value: number;
  }>;
  config: ChartConfig;
}

export function AssetBreakdownDonut({
  data,
  config,
}: AssetBreakdownDonutProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <ChartContainer
      config={config}
      className="aspect-square h-full w-full max-h-[100px]"
    >
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="assetType"
          innerRadius={20}
          outerRadius={35}
          strokeWidth={1}
        >
          {data.map((entry, index) => {
            const color = config[entry.assetType]?.color;
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
      </PieChart>
    </ChartContainer>
  );
}
