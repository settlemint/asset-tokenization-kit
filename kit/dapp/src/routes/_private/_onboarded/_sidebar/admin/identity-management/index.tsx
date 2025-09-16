import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { IdentityTable } from "@/components/identity/identity-table";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/"
)({
  component: IdentityManagementPage,
  loader: () => {
    return {
      breadcrumb: [createI18nBreadcrumbMetadata("identityManagement")],
    };
  },
});

function IdentityManagementPage() {
  const { t } = useTranslation("navigation");
  const { t: tClaims } = useTranslation("claims");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("identityManagement")}</h1>
        <p className="text-muted-foreground mt-2">
          {tClaims("page.description")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">{tClaims("page.loading")}</p>
          </div>
        }
      >
        <IdentityTable />
      </Suspense>
    </div>
  );
}
