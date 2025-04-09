import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getUserCount } from "@/lib/queries/user/user-count";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";

export async function UsersHistory() {
  const t = await getTranslations("admin.dashboard.charts");
  const locale = await getLocale();
  const today = endOfDay(new Date());
  const sevenDaysAgo = startOfDay(subDays(today, 7));

  const { users, totalUsersCount } = await getUserCount({
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
          aggregation: "last",
          accumulation: "current",
          historical: true,
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
