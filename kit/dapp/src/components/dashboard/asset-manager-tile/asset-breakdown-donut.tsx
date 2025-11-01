import { ASSET_COLORS } from "@/components/assets/asset-colors";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatsAssetsOutput } from "@/orpc/routes/system/stats/routes/assets.schema";
import type { AssetType } from "@atk/zod/asset-types";
import { toNumber } from "dnum";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart } from "recharts";

interface AssetBreakdownDonutProps {
  data: StatsAssetsOutput;
}

export function AssetBreakdownDonut({ data }: AssetBreakdownDonutProps) {
  const { t } = useTranslation("dashboard");

  if (Object.keys(data.valueBreakdown).length === 0) {
    return null;
  }

  // Exclude zero-value types to prevent visual clutter in donut chart
  const chartData = useMemo(() => {
    return Object.entries(data.valueBreakdown)
      .map(([assetType, value]) => ({
        assetType,
        value: toNumber(value),
      }))
      .filter((item) => item.value > 0);
  }, [data.valueBreakdown]);

  const chartConfig = {
    bond: { label: t("assetManagerCard.chart.bond"), color: ASSET_COLORS.bond },
    equity: {
      label: t("assetManagerCard.chart.equity"),
      color: ASSET_COLORS.equity,
    },
    fund: { label: t("assetManagerCard.chart.fund"), color: ASSET_COLORS.fund },
    stablecoin: {
      label: t("assetManagerCard.chart.stablecoin"),
      color: ASSET_COLORS.stablecoin,
    },
    deposit: {
      label: t("assetManagerCard.chart.deposit"),
      color: ASSET_COLORS.deposit,
    },
  } satisfies ChartConfig;

  const hasActivity = chartData.some((item) => item.value > 0);

  if (!hasActivity) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-full w-full max-h-[100px]"
    >
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="assetType"
          innerRadius={20}
          outerRadius={35}
          strokeWidth={1}
        >
          {chartData.map((entry, index) => {
            const color =
              chartConfig[entry.assetType as AssetType]?.color ??
              "var(--muted)";
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
