import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Hash, Mail, Shield, User as UserIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserActionsMenu } from "./user-actions-menu";

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
  const { t } = useTranslation("user");

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

  // Get current user data to check permissions
  const { data: currentUser } = useSuspenseQuery(orpc.user.me.queryOptions());

  /**
   * Defines the column configuration for the users table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "name",
          header: t("management.table.columns.name"),
          cell: ({ row }) => {
            const user = row.original;
            const displayName = user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.name;
            
            return (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayName}</span>
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.name"),
            type: "text",
            icon: UserIcon,
          },
        }),
        columnHelper.display({
          id: "email",
          header: t("management.table.columns.email"),
          cell: ({ row }) => {
            const email = row.original.email;
            return (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{email}</span>
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.email"),
            type: "text",
            icon: Mail,
          },
        }),
        columnHelper.display({
          id: "wallet",
          header: t("management.table.columns.wallet"),
          cell: ({ row }) => {
            const wallet = row.original.wallet;
            if (!wallet) {
              return (
                <span className="text-muted-foreground text-sm">
                  {t("management.table.noWallet")}
                </span>
              );
            }
            
            // Shorten wallet address for display
            const shortened = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
            
            return (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <code className="text-xs">{shortened}</code>
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.wallet"),
            type: "address",
            icon: Hash,
          },
        }),
        columnHelper.display({
          id: "role",
          header: t("management.table.columns.role"),
          cell: ({ row }) => {
            const role = row.original.role;
            return (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{role}</span>
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.role"),
            type: "text",
            icon: Shield,
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("management.table.columns.status"),
          cell: ({ row }) => {
            return <UserStatusBadge user={row.original} />;
          },
          meta: {
            displayName: t("management.table.columns.status"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "created",
          header: t("management.table.columns.created"),
          cell: () => {
            // Note: Created date would need to be added to the User type from the API
            // For now, showing a placeholder
            return (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">-</span>
              </div>
            );
          },
          meta: {
            displayName: t("management.table.columns.created"),
            type: "date",
            icon: Calendar,
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("management.table.columns.actions"),
          meta: {
            type: "none",
            enableCsvExport: false,
          },
          cell: ({ row }) => {
            const user = row.original;
            
            // Check if current user has permission to manage users
            const hasUserManagementPermission = 
              currentUser?.role === "admin" || 
              currentUser?.role === "issuer";

            if (!hasUserManagementPermission) {
              return null;
            }

            return <UserActionsMenu user={user} />;
          },
        }),
      ] as ColumnDef<User>[]),
    [t, currentUser]
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
          defaultPageSize: 10,
          enableGlobalFilter: true,
          enableRowSelection: false,
          debounceMs: 300,
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
        }}
        initialSorting={[
          {
            id: "name",
            desc: false,
          },
        ]}
      />
    </ComponentErrorBoundary>
  );
}