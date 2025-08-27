import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { AssetTypesByClass } from "@/components/platform-settings/asset-types-by-class";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/asset-types"
)({
  component: AssetTypesSettingsPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/admin/platform-settings/asset-types",
        }),
        createI18nBreadcrumbMetadata("settings.assetTypes.title"),
      ],
    };
  },
});

function AssetTypesSettingsPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("settings.assetTypes.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("settings.assetTypes.description")}
        </p>
      </div>

      <AssetTypesByClass />
    </div>
  );
}
