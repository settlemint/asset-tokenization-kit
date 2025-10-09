import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { UserWithIdentity } from "@/orpc/routes/user/routes/user.list.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { toast } from "sonner";

const columnHelper = createStrictColumnHelper<UserWithIdentity>();

/**
 * Users table component for displaying and managing platform users
 * Shows user information, linked identity, and actions for each user with chunked loading
 */
export const UsersTable = withErrorBoundary(function UsersTable() {
  const { t } = useTranslation("user");
  const router = useRouter();

  // Use local pagination state for server-side pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch users data using ORPC with server-side pagination
  const { data, isLoading, error } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy: sorting.length > 0 ? sorting[0]?.id : "createdAt",
        orderDirection:
          sorting.length > 0 ? (sorting[0]?.desc ? "desc" : "asc") : "desc",
        filters: {
          search: globalFilter,
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
        columnHelper.accessor("wallet", {
          header: t("management.table.columns.name"),
          meta: {
            displayName: t("management.table.columns.name"),
            type: "address",
          },
        }),
        columnHelper.accessor("email", {
          header: t("management.table.columns.email"),
          meta: {
            displayName: t("management.table.columns.email"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "identity",
          header: t("management.table.columns.identity"),
          cell: ({ row }) => {
            const identityAddress = row.original.identity;

            if (!identityAddress) {
              return (
                <span className="text-muted-foreground">
                  {t("management.table.identity.none")}
                </span>
              );
            }

            return (
              <CopyToClipboard value={identityAddress} className="max-w-full">
                <Link
                  to="/admin/identity-management/$address"
                  params={{ address: identityAddress }}
                  className="inline-flex min-w-0 max-w-full items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors hover:text-primary"
                >
                  <Web3Address
                    address={identityAddress}
                    size="small"
                    showBadge={false}
                    showPrettyName={false}
                    showFullAddress={false}
                    className="max-w-full"
                  />
                </Link>
              </CopyToClipboard>
            );
          },
          meta: {
            displayName: t("management.table.columns.identity"),
            type: "address",
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("management.table.columns.created"),
          meta: {
            displayName: t("management.table.columns.created"),
            type: "date",
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
      ] as ColumnDef<UserWithIdentity>[]),
    [t]
  );

  // Handle loading and error states
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {t("management.table.errors.loadFailed")}
        </p>
      </div>
    );
  }

  return (
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
        sorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
      }}
      urlState={{
        enabled: false, // Disable URL state since we're managing it manually
      }}
      advancedToolbar={{
        enableGlobalSearch: true, // Search by name (server side)
        enableFilters: false,
        enableExport: true,
        enableViewOptions: true,
        placeholder: t("management.table.search.placeholder"),
      }}
      pagination={{
        enablePagination: true,
        totalCount,
      }}
      initialPageSize={20}
      initialSorting={[
        {
          id: "createdAt",
          desc: true,
        },
      ]}
      customEmptyState={{
        title: isLoading
          ? t("management.table.emptyState.loading")
          : t("management.table.emptyState.title"),
        description: isLoading
          ? ""
          : t("management.table.emptyState.description"),
        icon: Users,
      }}
      onRowClick={handleRowClick}
    />
  );
});
