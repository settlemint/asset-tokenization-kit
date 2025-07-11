import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/actions/upcoming"
)({
  component: UpcomingActionsPage,
});

function UpcomingActionsPage() {
  const { t } = useTranslation("actions");

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold">{t("status.upcoming")}</h2>
      <div className="text-muted-foreground">{t("empty.upcoming")}</div>
    </div>
  );
}
