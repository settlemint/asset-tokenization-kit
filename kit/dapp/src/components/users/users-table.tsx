import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "@tanstack/react-router";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const { t } = useTranslation("user");

  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;

  // Pagination state for chunked loading
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50; // Load 50 users per chunk for better performance
  const offset = currentPage * pageSize;

  // Fetch users data using ORPC with pagination
  const { data: users = [], isLoading, error, isFetching } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: pageSize,
        offset,
        orderBy: "createdAt",
        orderDirection: "desc",
      },
    })
  );

  // Check if there might be more pages (if we got a full page)
  const hasNextPage = users.length === pageSize;
  const hasPrevPage = currentPage > 0;



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
        columnHelper.display({
          id: "userDisplay",
          header: t("management.table.columns.name"),
          cell: ({ row }: { row: { original: User } }) => {
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
        columnHelper.display({
          id: "status",
          header: t("management.table.columns.status"),
          cell: ({ row }: { row: { original: User } }) => {
            return <UserStatusBadge user={row.original} />;
          },
          meta: {
            displayName: t("management.table.columns.status"),
            type: "text",
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("management.table.columns.created"),
          meta: {
            displayName: t("management.table.columns.created"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "created",
          header: t("management.table.columns.created"),
          cell: ({ row }: { row: { original: User } }) => {
            const userData = row.original;
            const createdAt = userData.createdAt;
            
            if (!createdAt) {
              return <span className="text-sm text-muted-foreground">-</span>;
            }
            
            // Format the date for display
            const date = new Date(createdAt);
            // Check if the date is valid
            if (Number.isNaN(date.getTime())) {
              return <span className="text-sm text-muted-foreground">-</span>;
            }
            
            const formattedDate = date.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            
            return <span className="text-sm">{formattedDate}</span>;
          },
          meta: {
            displayName: t("management.table.columns.created"),
            type: "none",
          },
        }),
        columnHelper.display({
          id: "lastActive",
          header: t("management.table.columns.lastActive"),
          cell: ({ row }: { row: { original: User } }) => {
            const userData = row.original;
            const lastLoginAt = userData.lastLoginAt;
            
            if (!lastLoginAt) {
              return <span className="text-sm text-muted-foreground">Never</span>;
            }
            
            const loginDate = new Date(lastLoginAt);
            if (Number.isNaN(loginDate.getTime())) {
              return <span className="text-sm text-muted-foreground">Never</span>;
            }
            
            // Format the date for display with relative time using date-fns for better timezone handling
            if (isToday(loginDate)) {
              return <span className="text-sm">Today</span>;
            } else if (isYesterday(loginDate)) {
              return <span className="text-sm">Yesterday</span>;
            } else {
              const relativeTime = formatDistanceToNow(loginDate, { addSuffix: true });
              // For dates older than a week, show formatted date instead of relative time
              const daysDiff = Math.floor((Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff > 7) {
                const formattedDate = format(loginDate, 'MMM d, yyyy');
                return <span className="text-sm">{formattedDate}</span>;
              }
              return <span className="text-sm">{relativeTime}</span>;
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
      <div className="space-y-4">
        {/* Custom pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isFetching ? "Loading..." : `Showing ${users.length} users (Page ${currentPage + 1})`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(currentPage - 1);
              }}
              disabled={!hasPrevPage || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(currentPage + 1);
              }}
              disabled={!hasNextPage || isFetching}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DataTable
          name="users"
          data={users}
          columns={columns}
          isLoading={isLoading}
          urlState={{
            enabled: true,
            enableUrlPersistence: true,
            routePath,
            defaultPageSize: pageSize, // Use our page size but disable DataTable pagination
            enableGlobalFilter: true,
            enableRowSelection: false,
            debounceMs: 300,
          }}
          initialColumnVisibility={{
            name: false,
            email: false,
            createdAt: false,
          }}
          advancedToolbar={{
            enableGlobalSearch: false,
            enableFilters: true, // Keep client-side filters for the current chunk
            enableExport: true,
            enableViewOptions: true,
            placeholder: t("management.table.search.placeholder"),
          }}
          pagination={{
            enablePagination: false, // Disable DataTable's pagination, use our custom controls
          }}
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
      </div>
    </ComponentErrorBoundary>
  );
}