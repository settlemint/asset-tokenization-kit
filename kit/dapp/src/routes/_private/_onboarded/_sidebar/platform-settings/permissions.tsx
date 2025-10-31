import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { UsersPermissionsTable } from "@/components/participants/users/users-permissions-table";
import { ChangeSystemRolesSheet } from "@/components/manage-dropdown/sheets/change-role/change-system-roles-sheet";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { EthereumAddress } from "@atk/zod/ethereum-address";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/platform-settings/permissions"
)({
  component: PermissionsPage,
  loader: () => {
    return {
      breadcrumb: [
        createI18nBreadcrumbMetadata("platformSettings", {
          href: "/platform-settings/permissions",
        }),
        createI18nBreadcrumbMetadata("settings.permissions.title"),
      ],
    };
  },
});

function PermissionsPage() {
  const { t } = useTranslation(["navigation", "user"]);
  const [isChangeRolesOpen, setIsChangeRolesOpen] = useState(false);
  const [presetAccount, setPresetAccount] = useState<
    EthereumAddress | undefined
  >();

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const canGrantRoles = system?.userPermissions?.actions.grantRole ?? false;

  const handleOpenChangeRoles = (account?: EthereumAddress) => {
    setPresetAccount(account);
    setIsChangeRolesOpen(true);
  };

  return (
    <div className="w-full p-6">
      <RouterBreadcrumb />

      <div className="mb-8 mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {t("settings.permissions.title")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t("settings.permissions.description")}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => handleOpenChangeRoles()}
          disabled={!canGrantRoles}
        >
          {t("user:permissions.table.actions.addAdmin")}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Admin-only alert if user is not admin */}
        {user?.role !== "admin" && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>{t("settings.permissions.notAuthorized")}</AlertTitle>
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
          <UsersPermissionsTable
            onOpenChangeRoles={(account?: EthereumAddress) => {
              handleOpenChangeRoles(account);
            }}
          />
        </Suspense>
      </div>

      <ChangeSystemRolesSheet
        open={isChangeRolesOpen}
        onOpenChange={setIsChangeRolesOpen}
        accessControl={system?.systemAccessManager?.accessControl ?? undefined}
        presetAccount={presetAccount}
      />
    </div>
  );
}
