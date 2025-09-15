import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { ChangeSystemRolesSheet } from "@/components/manage-dropdown/sheets/change-role/change-system-roles-sheet";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import {
  CurrentUser,
  User as UserMe,
} from "@/orpc/routes/user/routes/user.me.schema";
import { EthereumAddress } from "@atk/zod/ethereum-address";
import { toast } from "sonner";

interface User extends Omit<UserMe, "roles"> {
  roles: string[];
}

const columnHelper = createStrictColumnHelper<User>();

function toLabel(role: string) {
  // Convert camelCase/pascalCase to spaced Title Case for display
  const spaced = role.replaceAll(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Users table component for displaying and managing platform users
 * Shows user information, registration status, and actions for each user with chunked loading
 */
export function UsersPermissionsTable() {
  const { t } = useTranslation("user");
  const router = useRouter();
  const [openChangeRoles, setOpenChangeRoles] = useState(false);
  const [presetAccount, setPresetAccount] = useState<
    EthereumAddress | undefined
  >(undefined);

  const { data: me } = useQuery(orpc.user.me.queryOptions());
  const canGrant = me?.userSystemPermissions?.actions.grantRole ?? false;
  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: {
        id: "default",
      },
    })
  );

  // Fetch users data using ORPC with server-side pagination
  const { data, isLoading, error } = useQuery(
    orpc.user.adminList.queryOptions()
  );

  // Extract users and total from the paginated response
  const users = useMemo(
    () =>
      data?.map(
        (user): User => ({
          ...user,
          roles: Object.entries(user.roles)
            .filter(([_, hasRole]) => hasRole)
            .map(([role]) => toLabel(role)),
        })
      ) ?? [],
    [data]
  );

  // Handle row click to navigate to user detail
  const handleRowClick = (user: User) => {
    void (async () => {
      try {
        await router.navigate({
          to: "/admin/user-management/$userId",
          params: { userId: user.id },
        });
      } catch {
        toast.error(t("permissions.table.errors.navigationFailed"));
      }
    })();
  };

  /**
   * Defines the column configuration for the users table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("wallet", {
          header: t("permissions.table.columns.name"),
          meta: {
            displayName: t("permissions.table.columns.name"),
            type: "address",
          },
        }),
        columnHelper.accessor("roles", {
          id: "roles",
          header: t("permissions.table.columns.role"),
          filterFn: (
            row,
            _id,
            value: {
              operator: "include";
              values: [string[]];
            }
          ) => {
            const roles = new Set(
              row.original.roles.map((item) => item.toLowerCase())
            );
            return value.values[0]?.every((valueFilter) =>
              roles.has(valueFilter.toLowerCase())
            );
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) =>
            (rowB.original.roles?.length ?? 0) -
            (rowA.original.roles?.length ?? 0),
          meta: {
            displayName: t("permissions.table.columns.role"),
            type: "multiOption",
            transformOptionFn: (value) => ({
              label: value,
              value: value,
            }),
          },
        }),
        columnHelper.accessor("lastLoginAt", {
          header: t("management.table.columns.lastActive"),
          meta: {
            displayName: t("management.table.columns.lastActive"),
            type: "date",
            dateOptions: {
              relative: true,
            },
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <RowActions
              me={me}
              row={row.original}
              onOpenChangeRoles={(account: EthereumAddress) => {
                setPresetAccount(account);
                setOpenChangeRoles(true);
              }}
            />
          ),
          meta: { type: "none", enableCsvExport: false },
        }),
      ] as ColumnDef<User>[]),
    [t, me]
  );

  // Handle loading and error states
  if (error) {
    return (
      <ComponentErrorBoundary componentName="Users Table">
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            {t("permissions.table.errors.loadFailed")}
          </p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="User Permissions Table">
      <DataTable
        name="users-permissions"
        data={users}
        columns={columns}
        isLoading={isLoading}
        urlState={{
          enabled: false, // Disable URL state since we're managing it manually
        }}
        advancedToolbar={{
          enableGlobalSearch: true,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          customActions: (
            <Button
              size="sm"
              onClick={() => {
                setPresetAccount(undefined);
                setOpenChangeRoles(true);
              }}
              disabled={!canGrant}
            >
              {t("permissions.table.actions.changeRoles")}
            </Button>
          ),
          placeholder: t("permissions.table.search.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialPageSize={20}
        customEmptyState={{
          title: isLoading
            ? t("permissions.table.emptyState.loading")
            : t("permissions.table.emptyState.title"),
          description: isLoading
            ? ""
            : t("permissions.table.emptyState.description"),
          icon: Users,
        }}
        onRowClick={handleRowClick}
      />
      <ChangeSystemRolesSheet
        open={openChangeRoles}
        onOpenChange={setOpenChangeRoles}
        accessControl={system?.accessControl ?? undefined}
        presetAccount={presetAccount}
      />
    </ComponentErrorBoundary>
  );
}

function RowActions({
  me,
  row,
  onOpenChangeRoles,
}: {
  me?: CurrentUser;
  row: User;
  onOpenChangeRoles: (account: EthereumAddress) => void;
}) {
  const { t } = useTranslation("user");
  const canGrantRole = me?.userSystemPermissions?.actions.grantRole ?? false;
  const canRevokeRole = me?.userSystemPermissions?.actions.revokeRole ?? false;
  const canChangeRoles = canGrantRole || canRevokeRole; // Can do either action

  const actions: ActionItem[] = [
    {
      label: t("permissions.table.actions.changeRoles"),
      onClick: () => {
        if (row.wallet) {
          onOpenChangeRoles(row.wallet);
        }
      },
      disabled: !row.wallet || !canChangeRoles,
    },
  ];

  return <ActionsCell actions={actions} />;
}
