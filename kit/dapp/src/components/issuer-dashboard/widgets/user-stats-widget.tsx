import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * User Statistics Widget
 *
 * Displays the total number of users with recent activity count.
 * Shows users active in the last X days (configurable) with proper pluralization.
 */
export function UserStatsWidget() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes user count
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.users")}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">
        {metrics.totalUsers.toLocaleString()}
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {t("stats.usersDescription", {
          count: metrics.recentUsers,
          days: metrics.recentActivityDays,
        })}
      </CardFooter>
    </Card>
  );
}
