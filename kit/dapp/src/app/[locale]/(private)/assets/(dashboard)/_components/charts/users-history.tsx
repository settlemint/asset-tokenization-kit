import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getUserCount } from "@/lib/queries/user/user-count";
import { startOfDay, subDays } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";

export async function UsersHistory() {
  const t = await getTranslations("admin.dashboard.charts");
  const locale = await getLocale();
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const { users } = await getUserCount({
    since: sevenDaysAgo,
  });

  const USERS_CHART_CONFIG = {
    users: {
      label: t("users-history.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <AreaChartComponent
      data={createTimeSeries(
        users,
        ["users"],
        {
          intervalType: "day",
          intervalLength: 7,
          granularity: "day",
          aggregation: "count",
          accumulation: "total",
        },
        locale
      )}
      config={USERS_CHART_CONFIG}
      title={t("users-history.title")}
      description={t("users-history.description")}
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
    />
  );
}
