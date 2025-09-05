import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { UsersTable } from "@/components/users/users-table";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/"
)({
  component: UserManagementPage,
  loader: () => {
    return {
      breadcrumb: [createI18nBreadcrumbMetadata("userManagement")],
    };
  },
});

function UserManagementPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">{t("userManagement")}</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions for your platform.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        }
      >
        <UsersTable />
      </Suspense>
    </div>
  );
}
