import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { UserDisplayCell } from "@/components/data-table/cells/user-display-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { toast } from "sonner";

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

  // Use local pagination state for server-side pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch users data using ORPC with server-side pagination
  const { data, isLoading, error } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy: "createdAt",
        orderDirection: "desc",
        filters: {
          hasSystemRole: true,
        },
      },
    })
  );

  // Extract users and total from the paginated response
  const users = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  // Handle row click to navigate to user detail
  const handleRowClick = (user: User) => {
    void (async () => {
      try {
        await router.navigate({
          to: "/admin/user-management/$userId",
          params: { userId: user.id },
        });
      } catch {
        toast.error(t("management.table.errors.navigationFailed"));
      }
    })();
  };

  /**
   * Defines the column configuration for the users table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "userDisplay",
          header: t("management.table.columns.name"),
          cell: ({ row }) => <UserDisplayCell user={row.original} />,
          meta: {
            displayName: t("management.table.columns.name"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "roles",
          header: t("management.table.columns.role"),
          cell: ({ row }) => {
            const roles = Object.entries(row.original.roles)
              .filter(([_, hasRole]) => hasRole)
              .map(([r]) => r);
            if (!roles?.length) return <span>-</span>;
            return (
              <div className="flex flex-wrap gap-1">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary">
                    {toLabel(r)}
                  </Badge>
                ))}
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.role"),
            type: "text",
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
            {t("management.table.errors.loadFailed")}
          </p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Users Table">
      <DataTable
        name="users"
        data={users}
        columns={columns}
        isLoading={isLoading}
        serverSidePagination={{
          enabled: true,
          totalCount,
        }}
        externalState={{
          pagination,
          onPaginationChange: setPagination,
        }}
        urlState={{
          enabled: false, // Disable URL state since we're managing it manually
        }}
        advancedToolbar={{
          enableGlobalSearch: false,
          enableFilters: true, // Re-enable filters now that columns are properly accessible
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("management.table.search.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialPageSize={20}
        initialSorting={[
          {
            id: "created",
            desc: true,
          },
        ]}
        customEmptyState={{
          title: t("management.table.emptyState.title"),
          description: isLoading
            ? t("management.table.emptyState.loading")
            : t("management.table.emptyState.description"),
          icon: Users,
        }}
        onRowClick={handleRowClick}
      />
    </ComponentErrorBoundary>
  );
}
