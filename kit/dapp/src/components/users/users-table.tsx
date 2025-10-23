import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
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

  const defaultSorting = useMemo<SortingState>(
    () => [
      {
        id: "name",
        desc: false,
      },
    ],
    []
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const sortColumnMap = useMemo(
    () => ({
      name: "name",
      email: "email",
      wallet: "wallet",
      identity: "wallet",
      createdAt: "createdAt",
    }),
    []
  );

  const activeSorting = sorting[0];
  const orderBy = activeSorting
    ? (sortColumnMap[activeSorting.id as keyof typeof sortColumnMap] ??
      "createdAt")
    : "createdAt";
  const orderDirection = activeSorting?.desc ? "desc" : "asc";

  // Fetch users data using ORPC with server-side pagination
  const { data, isLoading, error } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy,
        orderDirection,
        filters: {
          search: globalFilter.trim(),
        },
      },
    })
  );

  // Extract users and total from the paginated response
  const users = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  const handleRowClick = useCallback(
    (user: User) => {
      void (async () => {
        try {
          await router.navigate({
            to: "/participants/users/$userId",
            params: { userId: user.id },
          });
        } catch {
          toast.error(t("management.table.errors.navigationFailed"));
        }
      })();
    },
    [router, t]
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)): void => {
      setSorting((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const handleGlobalFilterChange = useCallback(
    (updater: string | ((old: string) => string)) => {
      setGlobalFilter((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next.trim();
      });
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const externalState = useMemo(
    () => ({
      pagination,
      sorting,
      globalFilter,
      onPaginationChange: setPagination,
      onGlobalFilterChange: handleGlobalFilterChange,
      onSortingChange: handleSortingChange,
    }),
    [
      globalFilter,
      handleGlobalFilterChange,
      handleSortingChange,
      pagination,
      setPagination,
      sorting,
    ]
  );

  // Normalize blockchain roles into the high-level participant types we surface.
  const resolveUserType = useCallback((user: UserWithIdentity) => {
    if (user.isAdmin || user.roles.admin || user.roles.systemManager) {
      return "admin" as const;
    }

    if (user.roles.claimIssuer || user.roles.trustedIssuersMetaRegistryModule) {
      return "trustedIssuer" as const;
    }

    return "investor" as const;
  }, []);

  // Collapse raw registration flags to the two badge states shown in the table UI.
  const resolveStatus = useCallback(
    (user: UserWithIdentity) =>
      user.isRegistered ? "registered" : "pendingRegistration",
    []
  );

  /**
   * Defines the column configuration for the users table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("name", {
          header: t("management.table.columns.name"),
          enableSorting: true,
          meta: {
            displayName: t("management.table.columns.name"),
            type: "text",
            emptyValue: t("management.table.fallback.unknown"),
          },
        }),
        columnHelper.accessor("email", {
          header: t("management.table.columns.email"),
          enableSorting: true,
          meta: {
            displayName: t("management.table.columns.email"),
            type: "text",
            emptyValue: t("management.table.fallback.unknown"),
          },
        }),
        columnHelper.accessor("wallet", {
          header: t("management.table.columns.wallet"),
          enableSorting: true,
          meta: {
            displayName: t("management.table.columns.wallet"),
            type: "address",
            emptyValue: t("management.table.noWallet"),
            renderCell: ({ row }) => {
              const address = row.original.wallet;

              if (!address) {
                return (
                  <span className="text-muted-foreground">
                    {t("management.table.noWallet")}
                  </span>
                );
              }

              return (
                <Web3Address
                  address={address}
                  size="tiny"
                  showPrettyName={false}
                  className="max-w-full"
                />
              );
            },
          },
        }),
        columnHelper.display({
          id: "identity",
          header: t("management.table.columns.identity"),
          enableSorting: false,
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
              <Web3Address
                address={identityAddress}
                size="tiny"
                className="max-w-full"
                showPrettyName={false}
                linkOptions={{
                  to: "/participants/entities/$address",
                  params: { address: identityAddress },
                }}
              />
            );
          },
          meta: {
            displayName: t("management.table.columns.identity"),
            type: "address",
          },
        }),
        columnHelper.display({
          id: "type",
          header: t("management.table.columns.type"),
          enableSorting: false,
          cell: ({ row }) => {
            const type = resolveUserType(row.original);
            const label = t(`management.table.userType.${type}`);

            return <Badge variant="outline">{label}</Badge>;
          },
          meta: {
            displayName: t("management.table.columns.type"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("management.table.columns.status"),
          enableSorting: false,
          cell: ({ row }) => {
            const status = resolveStatus(row.original);
            const label = t(`management.table.status.${status}`);

            const variant = status === "registered" ? "default" : "outline";

            return <Badge variant={variant}>{label}</Badge>;
          },
          meta: {
            displayName: t("management.table.columns.status"),
            type: "text",
          },
        }),
      ] as ColumnDef<UserWithIdentity>[]),
    [resolveStatus, resolveUserType, t]
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
      externalState={externalState}
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
      initialSorting={defaultSorting}
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
