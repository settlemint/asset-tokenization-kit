import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * User Statistics Widget
 *
 * Displays the total number of users with recent activity count.
 * Shows users active in the last X days (configurable) with proper pluralization.
 */
export function UserStatsWidget() {
  const { t } = useTranslation("stats");

  // Fetch just the user metrics - more efficient than fetching all metrics
  const { data: metrics } = useSuspenseQuery(
    orpc.user.stats.queryOptions({ input: { timeRange: 7 } })
  );

  return (
    <ComponentErrorBoundary componentName="User Stats Widget">
      <Card>
        <CardHeader>
          <CardTitle>{t("widgets.users.title")}</CardTitle>
        </CardHeader>
        <CardContent className="font-bold text-3xl">
          {metrics.totalUsers.toLocaleString()}
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          {t("widgets.users.description", {
            count: metrics.recentUsers,
            days: metrics.timeRangeDays,
          })}
        </CardFooter>
      </Card>
    </ComponentErrorBoundary>
  );
}
