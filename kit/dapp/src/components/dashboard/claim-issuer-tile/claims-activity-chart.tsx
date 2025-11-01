import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatsClaimsStatsOutput } from "@/orpc/routes/system/stats/routes/claims-stats.schema";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, XAxis } from "recharts";

interface ClaimsActivityChartProps {
  data: StatsClaimsStatsOutput;
}

export function ClaimsActivityChart({ data }: ClaimsActivityChartProps) {
  const { t } = useTranslation("dashboard");

  if (data.data.length === 0) {
    return null;
  }

  const chartConfig = {
    totalIssuedClaims: {
      label: t("claimIssuerCard.chart.issued"),
      color: "var(--chart-4)",
    },
    totalRevokedClaims: {
      label: t("claimIssuerCard.chart.revoked"),
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  // Convert cumulative totals to per-interval deltas for daily activity visualization
  const chartData = data.data.map((item, index) => {
    if (index === 0) {
      return {
        date: item.timestamp,
        totalIssuedClaims: item.totalIssuedClaims,
        totalRevokedClaims: item.totalRevokedClaims,
      };
    }
    const previous = data.data[index - 1];
    return {
      date: item.timestamp,
      totalIssuedClaims:
        item.totalIssuedClaims - (previous?.totalIssuedClaims ?? 0),
      totalRevokedClaims:
        item.totalRevokedClaims - (previous?.totalRevokedClaims ?? 0),
    };
  });

  const hasActivity = chartData.some(
    (item) => item.totalIssuedClaims > 0 || item.totalRevokedClaims > 0
  );

  if (!hasActivity) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-full w-full max-h-[100px]"
    >
      <BarChart data={chartData}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <XAxis dataKey="date" hide />
        <Bar
          dataKey="totalIssuedClaims"
          fill={chartConfig.totalIssuedClaims?.color}
          fillOpacity={0.5}
          radius={[4, 4, 0, 0]}
          stackId="claims"
        />
        <Bar
          dataKey="totalRevokedClaims"
          fill={chartConfig.totalRevokedClaims?.color}
          fillOpacity={0.5}
          radius={[4, 4, 0, 0]}
          stackId="claims"
        />
      </BarChart>
    </ChartContainer>
  );
}
