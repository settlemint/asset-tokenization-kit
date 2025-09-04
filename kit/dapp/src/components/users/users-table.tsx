import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Users } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

const columnHelper = createStrictColumnHelper<User>();

/**
 * Status badge component for user registration status
 */
function UserStatusBadge({ user }: { user: User }) {
  const { t } = useTranslation("user");

  if (user.isRegistered) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        {t("management.table.status.registered")}
      </Badge>
    );
  }

  if (user.wallet) {
    return (
      <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
        {t("management.table.status.pending")}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      {t("management.table.status.notConnected")}
    </Badge>
  );
}

/**
 * Users table component for displaying and managing platform users
 * Shows user information, registration status, and actions for each user with chunked loading
 */
export function UsersTable() {
  const { t } = useTranslation("user");

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
      },
    })
  );

  // Extract users and total from the paginated response  
  const users = data?.items ?? [];
  const totalCount = data?.total ?? 0;



  /**
   * Defines the column configuration for the users table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("name", {
          header: t("management.table.columns.name"),
          meta: {
            displayName: t("management.table.columns.name"),
            type: "text",
          },
        }),
        columnHelper.accessor("email", {
          header: t("management.table.columns.email"),
          meta: {
            displayName: t("management.table.columns.email"),
            type: "text",
          },
        }),
        columnHelper.accessor(
          (row: User) => {
            const displayName = row.firstName && row.lastName
              ? `${row.firstName} ${row.lastName}`
              : row.name;
            return displayName;
          },
          {
            id: "userDisplayText",
            header: t("management.table.columns.name"),
            meta: {
              displayName: t("management.table.columns.name"),
              type: "text",
            },
            filterFn: "includesString",
          }
        ),
        columnHelper.display({
          id: "userDisplay",
          header: t("management.table.columns.name"),
          cell: ({ row }) => {
            const user = row.original;
            const displayName = user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.name;
            
            if (!user.wallet) {
              return (
                <span className="font-medium">{displayName}</span>
              );
            }
            
            return (
              <div className="flex items-center gap-2">
                <Web3Address
                  address={user.wallet}
                  size="small"
                  showPrettyName={true}
                  showBadge={true}
                  copyToClipboard={true}
                />
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.name"),
            type: "none",
          },
        }),
        columnHelper.accessor(
          (row: User) => {
            if (row.isRegistered) return "registered";
            if (row.wallet) return "pending";
            return "notConnected";
          },
          {
            id: "statusText",
            header: t("management.table.columns.status"),
            meta: {
              displayName: t("management.table.columns.status"),
              type: "text",
            },
            filterFn: "equals",
          }
        ),
        columnHelper.display({
          id: "status",
          header: t("management.table.columns.status"),
          cell: ({ row }) => {
            return <UserStatusBadge user={row.original} />;
          },
          meta: {
            displayName: t("management.table.columns.status"),
            type: "none",
          },
        }),
        columnHelper.accessor("createdAt", {
          id: "createdAt",
          header: t("management.table.columns.created"),
          meta: {
            displayName: t("management.table.columns.created"),
            type: "text",
          },
          filterFn: "includesString",
        }),
        columnHelper.display({
          id: "created",
          header: t("management.table.columns.created"),
          cell: ({ row }) => {
            const createdAt = row.original.createdAt;
            
            if (!createdAt) {
              return <span className="text-sm text-muted-foreground">-</span>;
            }
            
            const date = new Date(createdAt);
            if (Number.isNaN(date.getTime())) {
              return <span className="text-sm text-muted-foreground">-</span>;
            }
            
            return (
              <span className="text-sm">
                {format(date, 'MMM d, yyyy')}
              </span>
            );
          },
          meta: {
            displayName: t("management.table.columns.created"),
            type: "none",
          },
        }),
        columnHelper.accessor("lastLoginAt", {
          id: "lastLoginAt",
          header: t("management.table.columns.lastActive"),
          meta: {
            displayName: t("management.table.columns.lastActive"),
            type: "text",
          },
          filterFn: "includesString",
        }),
        columnHelper.display({
          id: "lastActive",
          header: t("management.table.columns.lastActive"),
          cell: ({ row }) => {
            const lastLoginAt = row.original.lastLoginAt;
            
            if (!lastLoginAt) {
              return <span className="text-sm text-muted-foreground">Never</span>;
            }
            
            const loginDate = new Date(lastLoginAt);
            if (Number.isNaN(loginDate.getTime())) {
              return <span className="text-sm text-muted-foreground">Never</span>;
            }
            
            // Format with relative time for recent dates
            if (isToday(loginDate)) {
              return <span className="text-sm">Today</span>;
            } else if (isYesterday(loginDate)) {
              return <span className="text-sm">Yesterday</span>;
            } else {
              const daysDiff = Math.floor((Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff > 7) {
                return (
                  <span className="text-sm">
                    {format(loginDate, 'MMM d, yyyy')}
                  </span>
                );
              }
              return (
                <span className="text-sm">
                  {formatDistanceToNow(loginDate, { addSuffix: true })}
                </span>
              );
            }
          },
          meta: {
            displayName: t("management.table.columns.lastActive"),
            type: "none",
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
          <p className="text-muted-foreground">Failed to load users. Please try again.</p>
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
          initialColumnVisibility={{
            name: false,
            email: false,
            userDisplayText: false, // Hide the text-only version, show the display version
            statusText: false, // Hide the text-only version, show the display version  
            createdAt: false, // Hide the text-only version, show the display version
            lastLoginAt: false, // Hide the text-only version, show the display version
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
              id: "createdAt",
              desc: true,
            },
          ]}
          customEmptyState={{
            title: "No users found",
            description: isLoading ? "Loading users..." : "No users have been registered yet.",
            icon: Users,
          }}
        />
    </ComponentErrorBoundary>
  );
}