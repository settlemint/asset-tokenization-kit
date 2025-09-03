import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Web3Address } from "@/components/web3/web3-address";

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
 * Shows user information, registration status, and actions for each user
 */
export function UsersTable() {
  const router = useRouter();
  const { t } = useTranslation("user");

  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;

  // Fetch users data using ORPC with pagination support
  const { data: users } = useSuspenseQuery(
    orpc.user.list.queryOptions({
      input: {
        limit: 1000, // Will be handled by DataTable's pagination
        offset: 0,
        orderBy: "createdAt",
        orderDirection: "desc",
      },
    })
  );



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
            
            // Format the date for display with relative time
            const now = new Date();
            const diffInMs = now.getTime() - loginDate.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            
            if (diffInDays === 0) {
              return <span className="text-sm">Today</span>;
            } else if (diffInDays === 1) {
              return <span className="text-sm">Yesterday</span>;
            } else if (diffInDays < 7) {
              return <span className="text-sm">{diffInDays} days ago</span>;
            } else {
              const formattedDate = loginDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return <span className="text-sm">{formattedDate}</span>;
            }
          },
          meta: {
            displayName: t("management.table.columns.lastActive"),
            type: "date",
          },
        }),
      ] as ColumnDef<User>[]),
    [t]
  );

  return (
    <ComponentErrorBoundary componentName="Users Table">
      <DataTable
        name="users"
        data={users}
        columns={columns}
        urlState={{
          enabled: true,
          enableUrlPersistence: true,
          routePath,
          defaultPageSize: 10,
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
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("management.table.search.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={[
          {
            id: "user",
            desc: false,
          },
        ]}
        customEmptyState={{
          title: "No users found",
          description: "No users have been registered yet.",
          icon: Users,
        }}
      />
    </ComponentErrorBoundary>
  );
}