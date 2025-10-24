import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { EntityTable } from "@/components/participants/entities/entity-table";
import {
  CLAIM_ISSUER_ROLE,
  IDENTITY_MANAGER_ROLE,
} from "@/lib/constants/roles";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/entities/"
)({
  loader: async ({ context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    const roles = system.userPermissions?.roles;
    const canViewEntities = Boolean(
      roles?.[IDENTITY_MANAGER_ROLE.fieldName] ||
        roles?.[CLAIM_ISSUER_ROLE.fieldName]
    );

    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsEntities"),
      ],
      canViewEntities,
    } as const;
  },
  component: EntityManagementPage,
});

function EntityManagementPage() {
  const { t } = useTranslation(["entities", "navigation"]);
  const { canViewEntities } = Route.useLoaderData();

  if (!canViewEntities) {
    return (
      <div className="container mx-auto p-6">
        <RouterBreadcrumb />
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h1 className="text-2xl font-semibold">
            {t("entities:accessDenied.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("entities:accessDenied.description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">
          {t("navigation:entityManagement")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("entities:page.description")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground">
              {t("entities:page.loading")}
            </p>
          </div>
        }
      >
        <EntityTable />
      </Suspense>
    </div>
  );
}
