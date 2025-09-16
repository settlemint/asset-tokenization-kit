import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { FileCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DateCell } from "@/components/data-table/cells/date-cell";
import { UserDisplayCell } from "@/components/data-table/cells/user-display-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { toast } from "sonner";

// Mock claim type for now - this should be replaced with actual claim schema
interface Claim {
  id: string;
  user: User;
  claimType: string;
  topic: string;
  status: "pending" | "verified" | "rejected" | "expired";
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createStrictColumnHelper<Claim>();

/**
 * Status badge component for claim verification status
 */
function ClaimStatusBadge({ status }: { status: Claim["status"] }) {
  const { t } = useTranslation("claims");

  const statusConfig = {
    pending: { variant: "secondary" as const, label: t("status.pending") },
    verified: { variant: "default" as const, label: t("status.verified") },
    rejected: { variant: "destructive" as const, label: t("status.rejected") },
    expired: { variant: "outline" as const, label: t("status.expired") },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Claims table component for displaying and managing identity claims
 * Shows claim information, verification status, and actions for each claim
 */
export function ClaimsTable() {
  const { t } = useTranslation("claims");
  const router = useRouter();

  // Use local pagination state for server-side pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Mock data for now - replace with actual ORPC query when backend is ready
  const { data, isLoading, error } = useQuery({
    queryKey: ["claims", pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data - replace with actual API call
      return {
        items: [] as Claim[],
        total: 0,
      };
    },
  });

  // Extract claims and total from the paginated response
  const claims = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  // Handle row click to navigate to claim detail
  const handleRowClick = (claim: Claim) => {
    void (async () => {
      try {
        await router.navigate({
          to: "/admin/claim-management/$accountId",
          params: { accountId: claim.user.wallet || "" },
        });
      } catch {
        toast.error(t("table.errors.navigationFailed"));
      }
    })();
  };

  /**
   * Defines the column configuration for the claims table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "userDisplay",
          header: t("table.columns.user"),
          cell: ({ row }) => <UserDisplayCell user={row.original.user} />,
          filterFn: (row, _columnId, filterValue) => {
            const user = row.original.user;
            const displayName = getUserDisplayName(user);
            return displayName
              .toLowerCase()
              .includes((filterValue as string).toLowerCase());
          },
          meta: {
            displayName: t("table.columns.user"),
            type: "text",
          },
        }),
        columnHelper.accessor("claimType", {
          header: t("table.columns.claimType"),
          meta: {
            displayName: t("table.columns.claimType"),
            type: "text",
          },
        }),
        columnHelper.accessor("topic", {
          header: t("table.columns.topic"),
          meta: {
            displayName: t("table.columns.topic"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("table.columns.status"),
          cell: ({ row }) => <ClaimStatusBadge status={row.original.status} />,
          filterFn: (row, _columnId, filterValue) => {
            return row.original.status === filterValue;
          },
          meta: {
            displayName: t("table.columns.status"),
            type: "option",
            options: [
              { label: t("status.pending"), value: "pending" },
              { label: t("status.verified"), value: "verified" },
              { label: t("status.rejected"), value: "rejected" },
              { label: t("status.expired"), value: "expired" },
            ],
          },
        }),
        columnHelper.accessor("issuer", {
          header: t("table.columns.issuer"),
          meta: {
            displayName: t("table.columns.issuer"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "issuedAt",
          header: t("table.columns.issuedAt"),
          cell: ({ row }) => <DateCell value={row.original.issuedAt} />,
          meta: {
            displayName: t("table.columns.issuedAt"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "expiresAt",
          header: t("table.columns.expiresAt"),
          cell: ({ row }) => (
            <DateCell
              value={row.original.expiresAt}
              fallback={t("table.fallback.noExpiry")}
            />
          ),
          meta: {
            displayName: t("table.columns.expiresAt"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "verifiedAt",
          header: t("table.columns.verifiedAt"),
          cell: ({ row }) => (
            <DateCell
              value={row.original.verifiedAt}
              fallback={t("table.fallback.notVerified")}
            />
          ),
          meta: {
            displayName: t("table.columns.verifiedAt"),
            type: "date",
          },
        }),
      ] as ColumnDef<Claim>[]),
    [t]
  );

  // Handle loading and error states
  if (error) {
    return (
      <ComponentErrorBoundary componentName="Claims Table">
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            {t("table.errors.loadFailed")}
          </p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Claims Table">
      <DataTable
        name="claims"
        data={claims}
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
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("table.search.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialPageSize={20}
        initialSorting={[
          {
            id: "issuedAt",
            desc: true,
          },
        ]}
        customEmptyState={{
          title: t("table.emptyState.title"),
          description: isLoading
            ? t("table.emptyState.loading")
            : t("table.emptyState.description"),
          icon: FileCheck,
        }}
        onRowClick={handleRowClick}
      />
    </ComponentErrorBoundary>
  );
}
