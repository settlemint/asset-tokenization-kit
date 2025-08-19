import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/permissions"
)({
  component: PermissionsPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/admin/platform-settings/permissions",
        }),
        createI18nBreadcrumbMetadata("settings.permissions"),
      ],
    };
  },
});

function PermissionsPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("settings.permissions")}</h1>
        <p className="text-muted-foreground mt-2">
          Configure role-based access control and permission settings.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Permission settings coming soon...
        </p>
      </div>
    </div>
  );
}
