import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/platform-settings/compliance"
)({
  component: CompliancePage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/platform-settings/compliance",
        }),
        createI18nBreadcrumbMetadata("settings.compliance.title"),
      ],
    };
  },
});

function CompliancePage() {
  const { t } = useTranslation("navigation");

  // Full-width layout keeps compliance messaging consistent with other settings panels.
  return (
    <div className="w-full p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("settings.compliance.title")}</h1>
        <p className="text-muted-foreground mt-2">
          Manage compliance rules, KYC/AML settings, and regulatory
          requirements.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Compliance configuration coming soon...
        </p>
      </div>
    </div>
  );
}
