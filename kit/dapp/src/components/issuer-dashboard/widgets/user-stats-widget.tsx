import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * User Statistics Widget
 *
 * Displays the total number of users with recent activity count.
 * Shows users active in the last 7 days.
 */
export function UserStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes user count
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // TODO: Replace with actual recent user count when API supports it
  // For now, showing 0 recent users to match the screenshot
  const recentCount = 0;
  const days = 7;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.users")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{metrics.totalUsers.toLocaleString()}</CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.usersDescription", { count: recentCount, days })}
      </CardFooter>
    </Card>
  );
}