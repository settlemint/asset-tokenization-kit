import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/asset-types"
)({
  component: AssetTypesPage,
});

function AssetTypesPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("settings.assetTypes")}</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage different types of assets available on the
          platform.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Asset types configuration coming soon...
        </p>
      </div>
    </div>
  );
}
