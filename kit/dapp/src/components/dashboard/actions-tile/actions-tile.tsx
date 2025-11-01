import {
  Tile,
  TileBadge,
  TileContent,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileHeaderContent,
  TileIcon,
  TileTitle,
} from "@/components/tile/tile";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { AlertCircle, CheckCircle2, ListTodo } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Actions tile for the dashboard showing pending and recently completed actions.
 *
 * Displays:
 * - Badge showing pending count or "Up to date"
 * - Count of pending actions requiring user attention
 * - Count of actions completed in the last 7 days
 * - Link to full actions page
 */
export function ActionsTile() {
  const { t } = useTranslation("dashboard");

  const { data: actions } = useSuspenseQuery(
    orpc.actions.list.queryOptions({
      input: {},
    })
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = subDays(now, 7).getTime();

    const pendingCount = actions.filter(
      (action) => action.status === "PENDING"
    ).length;

    const completedCount = actions.filter((action) => {
      if (action.status !== "EXECUTED" || !action.executedAt) {
        return false;
      }
      return action.executedAt.getTime() >= sevenDaysAgo;
    }).length;

    return { pendingCount, completedCount };
  }, [actions]);

  const hasPending = stats.pendingCount > 0;

  return (
    <Tile>
      <TileHeader>
        <TileIcon icon={ListTodo} className="bg-warning/10 text-warning" />
        <TileHeaderContent>
          <TileTitle>{t("actionsCard.title")}</TileTitle>
        </TileHeaderContent>
        <TileBadge
          variant={hasPending ? "default" : "secondary"}
          className={cn(
            "gap-1.5",
            !hasPending && "border-success/20 bg-success/10 text-success"
          )}
        >
          {hasPending ? (
            t("actionsCard.badge.pending", { count: stats.pendingCount })
          ) : (
            <>
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {t("actionsCard.badge.upToDate")}
            </>
          )}
        </TileBadge>
      </TileHeader>

      <TileContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">
              {t("actionsCard.stats.pending")}
            </span>
            <div className="flex items-center gap-3">
              {hasPending ? (
                <>
                  <AlertCircle
                    className="size-5 text-warning"
                    aria-hidden="true"
                  />
                  <span className="text-3xl font-bold tabular-nums">
                    {stats.pendingCount}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    className="size-5 text-success"
                    aria-hidden="true"
                  />
                  <span className="text-base text-success">
                    {t("actionsCard.stats.noPending")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <CheckCircle2
                className="size-3.5 text-success"
                aria-hidden="true"
              />
              <span className="tabular-nums text-success">
                {stats.completedCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {t("actionsCard.stats.completed")}
            </span>
          </div>
        </div>
      </TileContent>

      <TileFooter>
        <TileFooterAction to="/actions" variant="outline" className="w-full">
          {t("actionsCard.cta")}
        </TileFooterAction>
      </TileFooter>
    </Tile>
  );
}
