import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { ActionTabs } from "@/components/actions/action-tabs";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/actions")({
  component: ActionsLayout,
});

function ActionsLayout() {
  const { t } = useTranslation("actions");

  return (
    <>
      <PageHeader title={t("page.actions")} />
      <ActionTabs path="actions" />
    </>
  );
}
