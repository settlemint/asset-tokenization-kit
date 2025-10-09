import { AreaChartComponent } from "@/components/charts/area-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { formatNumber } from "@/lib/utils/format-value/format-number";
import { formatChartDate } from "@/lib/utils/timeseries";
import { orpc } from "@/orpc/orpc-client";
import {
  resolveStatsRange,
  type StatsRangeInput,
  type StatsResolvedRange,
} from "@atk/zod/stats-range";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildChartRangeDescription } from "./chart-range-description";

export type IdentityGrowthAreaChartProps = {
  range: StatsRangeInput;
};

export const IdentityGrowthAreaChart = withErrorBoundary(
  function IdentityGrowthAreaChart({ range }: IdentityGrowthAreaChartProps) {
    const { t } = useTranslation("stats");
    const { i18n } = useTranslation();
    const locale = i18n.language;

    const chartConfig: ChartConfig = useMemo(
      () => ({
        activeUserIdentitiesCount: {
          label: t("charts.identityGrowth.label"),
          color: "var(--chart-1)",
        },
      }),
      [t]
    );

    const { data: rawData } = useQuery(
      orpc.system.stats.identityStatsOverTime.queryOptions({
        input: range,
        ...CHART_QUERY_OPTIONS,
      })
    );

    const fallbackRange = useMemo<StatsResolvedRange>(() => {
      return resolveStatsRange(range);
    }, [range]);

    const resolvedRange = rawData?.range ?? fallbackRange;

    const overRange = buildChartRangeDescription({
      range: resolvedRange,
      t,
    });

    const chartInterval = resolvedRange.interval;
    const timeseries = rawData?.identityStats ?? [];

    const description = t("charts.identityGrowth.description", {
      overRange,
    });

    const dataKeys = ["activeUserIdentitiesCount"];

    return (
      <AreaChartComponent
        title={t("charts.identityGrowth.title")}
        description={description}
        interval={chartInterval}
        data={timeseries}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        showYAxis
        stacked={false}
        xTickFormatter={(value: string | Date | number) =>
          formatChartDate(value, chartInterval, locale)
        }
        yTickFormatter={(value: string) =>
          formatNumber(
            value,
            {
              type: "number",
            },
            locale
          )
        }
        emptyMessage={t("charts.identityGrowth.empty.title")}
        emptyDescription={t("charts.identityGrowth.empty.description")}
      />
    );
  }
);
