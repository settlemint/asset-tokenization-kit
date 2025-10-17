import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { UsersTable } from "@/components/users/users-table";
import { IDENTITY_MANAGER_ROLE } from "@/lib/constants/roles";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/"
)({
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    if (!system.userPermissions?.roles[IDENTITY_MANAGER_ROLE.fieldName]) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: UserManagementPage,
  loader: () => {
    return {
      breadcrumb: [createI18nBreadcrumbMetadata("userManagement")],
    };
  },
});

function UserManagementPage() {
  const { t } = useTranslation(["navigation", "user"]);

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("userManagement")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("user:management.page.description")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">
              {t("user:management.table.emptyState.loading")}
            </p>
          </div>
        }
      >
        <UsersTable />
      </Suspense>
    </div>
  );
}
