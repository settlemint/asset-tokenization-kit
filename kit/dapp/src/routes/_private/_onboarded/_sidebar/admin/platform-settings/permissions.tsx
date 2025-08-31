import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { GrantRoleForm } from "@/components/platform-settings/role-management/grant-role-form";
import { ViewUserRoles } from "@/components/platform-settings/role-management/view-user-roles";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />

      <div className="mb-8 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t("settings.permissions")}</h1>
        </div>
        <p className="text-muted-foreground">
          Manage user permissions and blockchain roles for the Asset
          Tokenization Kit
        </p>
      </div>

      <div className="space-y-6">
        {/* Admin-only alert if user is not admin */}
        {user?.role !== "admin" && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              You need administrator privileges to manage permissions and roles.
              Please contact your system administrator for access.
            </AlertDescription>
          </Alert>
        )}

        {/* Role Management Form - Show only if user is admin */}
        {user?.role === "admin" && (
          <>
            <GrantRoleForm />
            <ViewUserRoles />

            {/* Future sections can be added here */}
            <div className="text-sm text-muted-foreground mt-8">
              More permission management features coming soon...
            </div>
          </>
        )}
      </div>
    </div>
  );
}
