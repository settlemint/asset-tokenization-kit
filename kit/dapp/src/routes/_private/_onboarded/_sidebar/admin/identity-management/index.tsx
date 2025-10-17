import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { IdentityTable } from "@/components/identity/identity-table";
import { CLAIM_ISSUER_ROLE } from "@/lib/constants/roles";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/"
)({
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    if (!system.userPermissions?.roles[CLAIM_ISSUER_ROLE.fieldName]) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: IdentityManagementPage,
  loader: () => {
    return {
      breadcrumb: [createI18nBreadcrumbMetadata("identityManagement")],
    };
  },
});

function IdentityManagementPage() {
  const { t } = useTranslation(["identities", "navigation"]);

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">
          {t("navigation:identityManagement")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("identities:page.description")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">
              {t("identities:page.loading")}
            </p>
          </div>
        }
      >
        <IdentityTable />
      </Suspense>
    </div>
  );
}
