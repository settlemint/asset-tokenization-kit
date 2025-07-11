import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/actions/")({
  component: ActionsPage,
});

function ActionsPage() {
  const { t } = useTranslation("actions");

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-muted-foreground">{t("empty.default")}</div>
    </div>
  );
}
