import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { AddonsManagement } from "@/components/system-addons/management/addons-management";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/platform-settings/addons"
)({
  component: AddonsSettingsPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/platform-settings/addons",
        }),
        createI18nBreadcrumbMetadata("settings.addons.title"),
      ],
    };
  },
});

function AddonsSettingsPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("settings.addons.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("settings.addons.description")}
        </p>
      </div>

      <AddonsManagement />
    </div>
  );
}
