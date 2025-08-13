import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/platform-settings/claim-topics-issuers"
)({
  component: ClaimTopicsIssuersPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/admin/platform-settings/claim-topics-issuers",
        }),
        createI18nBreadcrumbMetadata("settings.claimTopicsIssuers"),
      ],
    };
  },
});

function ClaimTopicsIssuersPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">
          {t("settings.claimTopicsIssuers")}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage claim topics and trusted issuers for identity verification.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Claim topics and issuers configuration coming soon...
        </p>
      </div>
    </div>
  );
}
