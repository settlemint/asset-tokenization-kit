import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { orpc } from "@/orpc/orpc-client";
import type { User as UserMe } from "@/orpc/routes/user/routes/user.me.schema";
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

  // Fetch users data using ORPC with server-side pagination
  const { data, isLoading, error } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        orderBy: "createdAt",
        orderDirection: "desc",
        filters: {
          hasSystemRole: true,
        },
      },
    })
  );

  // Extract users and total from the paginated response
  const users =
    data?.items.map(
      (user): User => ({
        ...user,
        roles: Object.entries(user.roles)
          .filter(([_, hasRole]) => hasRole)
          .map(([role]) => toLabel(role)),
      })
    ) ?? [];

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
      ] as ColumnDef<User>[]),
    [t]
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
          placeholder: t("permissions.table.search.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialPageSize={20}
        customEmptyState={{
          title: t("permissions.table.emptyState.title"),
          description: isLoading
            ? t("permissions.table.emptyState.loading")
            : t("permissions.table.emptyState.description"),
          icon: Users,
        }}
        onRowClick={handleRowClick}
      />
    </ComponentErrorBoundary>
  );
}
