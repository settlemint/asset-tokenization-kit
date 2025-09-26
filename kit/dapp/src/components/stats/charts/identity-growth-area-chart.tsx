import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import {
  resolveStatsRange,
  type StatsRangeInput,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { getTimestamp } from "@atk/zod/timestamp";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { buildChartRangeDescription } from "./chart-range-description";

export type IdentityGrowthAreaChartProps = {
  range: StatsRangeInput;
};

export function IdentityGrowthAreaChart({
  range,
}: IdentityGrowthAreaChartProps) {
  const { t } = useTranslation("stats");

  const chartConfig: ChartConfig = useMemo(
    () => ({
      activeUserIdentitiesCount: {
        label: t("charts.identityGrowth.label"),
        color: "var(--chart-1)",
      },
    }),
    [t]
  );

  const dataKeys = useMemo(() => ["activeUserIdentitiesCount"], []);

  const { data: rawData } = useQuery(
    orpc.system.stats.identityStatsOverTime.queryOptions({
      input: range,
      ...CHART_QUERY_OPTIONS,
    })
  );

  const chartData = useMemo(() => {
    if (!rawData) {
      return [];
    }

    const interval = rawData.range.interval;

    return rawData.identityStats.map((item) => {
      const timestamp = getTimestamp(item.timestamp);
      const formattedTimestamp =
        interval === "hour"
          ? format(timestamp, "MMM dd HH:mm")
          : format(timestamp, "MMM dd");

      return {
        timestamp: formattedTimestamp,
        activeUserIdentitiesCount: item.activeUserIdentitiesCount,
      };
    });
  }, [rawData]);

  const fallbackRange = useMemo<StatsResolvedRange>(() => {
    return resolveStatsRange(range);
  }, [range]);

  const resolvedRange = rawData?.range ?? fallbackRange;

  const overRange = buildChartRangeDescription({
    range: resolvedRange,
    t,
  });

  const description = t("charts.identityGrowth.description", {
    overRange,
  });

  const chartInterval = resolvedRange.interval;

  return (
    <ComponentErrorBoundary componentName="Identity Growth Chart">
      <AreaChartComponent
        title={t("charts.identityGrowth.title")}
        description={description}
        interval={chartInterval}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        showYAxis
        stacked={false}
        yTickFormatter={(value: string) =>
          Number(value).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        }
        emptyMessage={t("charts.identityGrowth.empty.title")}
        emptyDescription={t("charts.identityGrowth.empty.description")}
      />
    </ComponentErrorBoundary>
  );
}
