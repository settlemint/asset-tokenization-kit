import { getUserCount } from "@/lib/queries/user/user-count";
import { startOfDay, subDays } from "date-fns";
import { getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function UsersWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const { totalUsersCount, recentUsersCount } = await getUserCount({
    since: sevenDaysAgo,
  });

  return (
    <Widget
      label={t("users.label")}
      value={totalUsersCount.toLocaleString()}
      subtext={t("users.subtext", { count: recentUsersCount, days: 7 })}
    />
  );
}
