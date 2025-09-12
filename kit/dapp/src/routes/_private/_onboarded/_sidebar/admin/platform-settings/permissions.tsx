import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { GrantRoleForm } from "@/components/platform-settings/role-management/grant-role-form";
import { ViewUserRoles } from "@/components/platform-settings/role-management/view-user-roles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UsersPermissionsTable } from "@/components/users/users-permissions-table";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Suspense } from "react";
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
        createI18nBreadcrumbMetadata("settings.permissions.title"),
      ],
    };
  },
});

function PermissionsPage() {
  const { t } = useTranslation("navigation");

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />

      <div className="mb-8 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {t("settings.permissions.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t("settings.permissions.description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Admin-only alert if user is not admin */}
        {user?.role !== "admin" && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>
              {t("settings.permissions.adminRequired.title")}
            </AlertTitle>
            <AlertDescription>
              {t("settings.permissions.adminRequired.description")}
            </AlertDescription>
          </Alert>
        )}

        <Suspense
          fallback={
            <div className="rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">
                {t("management.table.emptyState.loading", { ns: "user" })}
              </p>
            </div>
          }
        >
          <UsersPermissionsTable />
        </Suspense>

        {/* Role Management Form - Show only if user is admin */}
        {user?.role === "admin" && (
          <>
            <GrantRoleForm />
            <ViewUserRoles />
          </>
        )}
      </div>
    </div>
  );
}
