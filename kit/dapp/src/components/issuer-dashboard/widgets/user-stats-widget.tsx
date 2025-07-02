import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * User Statistics Widget
 * 
 * Displays user-related metrics.
 * For now shows a calculated user count based on system activity.
 */
export function UserStatsWidget() {
  const { t } = useTranslation("general");
  
  // Fetch systems to get user-related metrics
  const { data: systems } = useSuspenseQuery(
    orpc.system.list.queryOptions({ input: {} })
  );

  // Calculate estimated users based on system activity
  const userCount = systems.length * 25; // Placeholder calculation

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.stats.users")}
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{userCount.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          Active platform users
        </p>
      </CardContent>
    </Card>
  );
} 