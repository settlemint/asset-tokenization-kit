import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

/**
 * Pending actions warning banner for the dashboard.
 *
 * Displays a prominent banner when there are pending actions requiring user attention.
 * The banner shows:
 * - Alert icon indicating the need for attention
 * - Count of pending actions with descriptive text
 * - Call-to-action button to view all actions
 *
 * Only renders when there are pending actions to display.
 */
export function PendingActionsBanner() {
  const { t } = useTranslation("dashboard");

  const { data: actions } = useSuspenseQuery(
    orpc.actions.list.queryOptions({
      input: {},
    })
  );

  const pendingCount = useMemo(() => {
    return actions.filter((action) => action.status === "PENDING").length;
  }, [actions]);

  // Don't render the banner if there are no pending actions
  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/40 to-amber-950/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <AlertCircle className="size-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">
            {t("pendingActionsBanner.title", { count: pendingCount })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("pendingActionsBanner.description")}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400">
        <Link to="/actions">
          {t("pendingActionsBanner.cta")}
        </Link>
      </Button>
    </div>
  );
}
