import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc/orpc-client";
import { UserWithIdentity } from "@/orpc/routes/user/routes/user.list.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const columnHelper = createStrictColumnHelper<UserWithIdentity>();

/**
 * Users table component for displaying and managing platform users
 * Shows user information, linked identity, and actions for each user with chunked loading
 */
export const UsersTable = withErrorBoundary(function UsersTable() {
  const { t } = useTranslation("user");
  const router = useRouter();
  const routePath = router.state.matches.at(-1)?.pathname;

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
  const columns = useMemo(() => {
    return withAutoFeatures([
      columnHelper.accessor("name", {
        header: t("management.table.columns.name"),
        enableSorting: true,
        meta: {
          displayName: t("management.table.columns.name"),
          type: "text",
          emptyValue: t("management.table.fallback.unknown"),
          renderCell: (context) => {
            const value = context.getValue();
            const fallback = context.column.columnDef.meta?.emptyValue ?? "";

            if (!value) {
              return fallback;
            }

            const text = typeof value === "string" ? value : String(value);

            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block min-w-0 max-w-[240px] truncate text-left">
                    {text}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{text}</TooltipContent>
              </Tooltip>
            );
          },
        },
      }),
      columnHelper.accessor("email", {
        header: t("management.table.columns.email"),
        enableSorting: true,
        meta: {
          displayName: t("management.table.columns.email"),
          type: "text",
          emptyValue: t("management.table.fallback.unknown"),
          renderCell: (context) => {
            const value = context.getValue();
            const fallback = context.column.columnDef.meta?.emptyValue ?? "";

            if (!value) {
              return fallback;
            }

            const text = typeof value === "string" ? value : String(value);

            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block min-w-0 max-w-[260px] truncate text-left">
                    {text}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{text}</TooltipContent>
              </Tooltip>
            );
          },
        },
      }),
      columnHelper.accessor("wallet", {
        header: t("management.table.columns.wallet"),
        enableSorting: true,
        meta: {
          displayName: t("management.table.columns.wallet"),
          type: "address",
          emptyValue: t("management.table.fallback.unknown"),
          addressOptions: {
            size: "tiny",
            showPrettyName: false,
            className: "max-w-full",
          },
        },
      }),
      columnHelper.accessor("identity", {
        header: t("management.table.columns.identity"),
        enableSorting: false,
        meta: {
          displayName: t("management.table.columns.identity"),
          type: "address",
          emptyValue: t("management.table.fallback.unknown"),
          addressOptions: {
            size: "tiny",
            showPrettyName: false,
            className: "max-w-full",
            linkOptions: {
              to: "/participants/entities/$address",
            },
          },
        },
      }),
      columnHelper.accessor((row) => resolveUserType(row), {
        id: "type",
        header: t("management.table.columns.type"),
        enableSorting: false,
        meta: {
          displayName: t("management.table.columns.type"),
          type: "option",
          options: [
            {
              value: "admin",
              label: t("management.table.type.admin"),
            },
            {
              value: "trustedIssuer",
              label: t("management.table.type.trustedIssuer"),
            },
            {
              value: "investor",
              label: t("management.table.type.investor"),
            },
          ],
          renderCell: ({ getValue }) => {
            const type = getValue();

            if (typeof type !== "string" || type.length === 0) {
              return (
                <span className="text-muted-foreground">
                  {t("management.table.fallback.unknown")}
                </span>
              );
            }

            return (
              <Badge variant="outline">
                {t(`management.table.type.${type}`)}
              </Badge>
            );
          },
        },
      }),
      columnHelper.accessor((row) => resolveStatus(row), {
        header: t("management.table.columns.status"),
        enableSorting: false,
        meta: {
          displayName: t("management.table.columns.status"),
          type: "option",
          options: [
            {
              value: "registered",
              label: t("management.table.status.registered"),
            },
            {
              value: "pending",
              label: t("management.table.status.pending"),
            },
          ],
          renderCell: ({ getValue }) => {
            const status = getValue();
            const translationKey =
              status === "registered"
                ? "management.table.status.registered"
                : "management.table.status.pending";
            const variant = status === "registered" ? "default" : "outline";

            return <Badge variant={variant}>{t(translationKey)}</Badge>;
          },
        },
      }),
    ]) as ColumnDef<UserWithIdentity>[];
  }, [resolveStatus, resolveUserType, t]);

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
        enabled: true,
        routePath,
      }}
      advancedToolbar={{
        enableGlobalSearch: true,
        enableFilters: true,
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
