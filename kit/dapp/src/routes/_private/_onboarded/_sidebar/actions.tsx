import { ActionsOverview } from "@/components/actions/actions-overview";
import { orpc } from "@/orpc/orpc-client";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/actions")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(
      orpc.actions.list.queryOptions({
        input: {},
      })
    );
  },
  component: ActionsRoute,
});

function ActionsRoute() {
  const { t } = useTranslation("actions");

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <ActionsOverview />
    </div>
  );
}
