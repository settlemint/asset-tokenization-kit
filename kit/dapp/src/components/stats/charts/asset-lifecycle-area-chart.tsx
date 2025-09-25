import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays } from "date-fns";
import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";
import { parseISO } from "date-fns/parseISO";
import { subDays } from "date-fns/subDays";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetLifecycleAreaChartProps {
  interval?: "hour" | "day";
  from?: string;
  to?: string;
}

export function AssetLifecycleAreaChart({
  interval = "day",
  from,
  to,
}: AssetLifecycleAreaChartProps) {
  const { t } = useTranslation("stats");

  const chartConfig: ChartConfig = useMemo(
    () => ({
      assetsCreated: {
        label: t("charts.assetLifecycle.createdLabel"),
        color: "var(--chart-1)",
      },
      assetsLaunched: {
        label: t("charts.assetLifecycle.launchedLabel"),
        color: "var(--chart-2)",
      },
    }),
    [t]
  );

  const dataKeys = useMemo(() => ["assetsCreated", "assetsLaunched"], []);

  const { input, rangeDays } = useMemo(() => {
    const parseDate = (value?: string) => {
      if (!value) return undefined;
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : undefined;
    };

    const computedTo = parseDate(to) ?? new Date();
    const fallbackRange = 7;
    const computedFrom = parseDate(from) ?? subDays(computedTo, fallbackRange);

    const rangeDays = differenceInCalendarDays(computedTo, computedFrom);

    return {
      input: {
        interval,
        from: computedFrom.toISOString(),
        to: computedTo.toISOString(),
      },
      rangeDays,
    } as const;
  }, [interval, from, to]);

  const { data: rawData } = useQuery(
    orpc.system.stats.assetLifecycle.queryOptions({
      input,
      ...CHART_QUERY_OPTIONS,
    })
  );

  const chartData = useMemo(() => {
    if (!rawData || rawData.data.length === 0) {
      return [];
    }

    return rawData.data.map((item) => {
      const formattedTimestamp =
        interval === "hour"
          ? format(item.timestamp, "MMM dd HH:mm")
          : format(item.timestamp, "MMM dd");

      return {
        timestamp: formattedTimestamp,
        assetsCreated: item.assetsCreatedCount,
        assetsLaunched: item.assetsLaunchedCount,
      };
    });
  }, [interval, rawData]);

  return (
    <ComponentErrorBoundary componentName="Asset Lifecycle Chart">
      <AreaChartComponent
        title={t("charts.assetLifecycle.title")}
        description={t("charts.assetLifecycle.description", {
          days: rangeDays,
          interval,
        })}
        interval={interval}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend
        stacked={false}
        yTickFormatter={(value: string) =>
          Number(value).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })
        }
        emptyMessage={t("charts.assetLifecycle.empty.title")}
        emptyDescription={t("charts.assetLifecycle.empty.description")}
      />
    </ComponentErrorBoundary>
  );
}
