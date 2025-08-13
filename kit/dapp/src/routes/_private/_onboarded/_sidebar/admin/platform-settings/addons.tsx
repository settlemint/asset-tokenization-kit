import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/addons"
)({
  component: AddonsSettingsPage,
});

function AddonsSettingsPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("settings.addons")}</h1>
        <p className="text-muted-foreground mt-2">
          Configure addon modules, integrations, and platform extensions.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Addon settings coming soon...</p>
      </div>
    </div>
  );
}
