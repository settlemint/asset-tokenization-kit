import { Button } from "@/components/ui/button";
import { WarningAlert } from "@/components/ui/warning-alert";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
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
    <WarningAlert
      title={t("pendingActionsBanner.title", { count: pendingCount })}
      description={t("pendingActionsBanner.description")}
      cta={
        <Button asChild variant="outline">
          <Link to="/actions">{t("pendingActionsBanner.cta")}</Link>
        </Button>
      }
    />
  );
}
