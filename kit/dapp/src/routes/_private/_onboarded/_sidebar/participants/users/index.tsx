import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { UsersTable } from "@/components/participants/users/users-table";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/"
)({
  loader: async ({ context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    const roles = system.userPermissions?.roles;
    const canViewUsers = Boolean(roles?.identityManager || roles?.claimIssuer);

    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsUsers"),
      ],
      canViewUsers,
    } as const;
  },
  component: UserManagementPage,
});

function UserManagementPage() {
  const { t } = useTranslation(["navigation", "user"]);
  const { canViewUsers } = Route.useLoaderData();

  if (!canViewUsers) {
    return (
      <div className="container mx-auto p-6">
        <RouterBreadcrumb />
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h1 className="text-2xl font-semibold">
            {t("user:management.accessDenied.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("user:management.accessDenied.description")}
          </p>
        </div>
      </div>
    );
  }

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
