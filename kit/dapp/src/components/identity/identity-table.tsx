import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { IdentityTypeBadge } from "@/components/identity/identity-type-badge";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { IdentityListOutput } from "@/orpc/routes/system/identity/routes/identity.list.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { CellContext, ColumnDef } from "@tanstack/table-core";
import { Fingerprint } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type IdentityRow = IdentityListOutput["items"][number];

const columnHelper = createStrictColumnHelper<IdentityRow>();

export const IdentityTable = withErrorBoundary(function IdentityTable() {
  const router = useRouter();
  const { t } = useTranslation("identities");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, error } = useQuery(
    orpc.system.identity.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy: "deployedInTransaction",
        orderDirection: "desc",
      },
    })
  );

  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  const handleRowClick = async (identity: IdentityRow) => {
    try {
      await router.navigate({
        to: "/admin/identity-management/$address",
        params: { address: identity.id },
      });
    } catch {
      toast.error(t("identityTable.errors.navigationFailed"));
    }
  };

  const columns = useMemo(
    () =>
      withAutoFeatures([
        // Identity ID column - shows the unique identity identifier
        columnHelper.display({
          id: "identityId",
          header: t("identityTable.columns.id"),
          cell: ({ row }) => (
            <Web3Address
              address={row.original.id}
              size="small"
              copyToClipboard
              showBadge={false}
              showPrettyName={false}
            />
          ),
          meta: {
            displayName: t("identityTable.columns.id"),
            type: "none",
          },
        }),
        // Hidden accessor column for filtering functionality
        // This column provides searchable text content but is not visible in the UI
        // It allows users to filter by contract name, addresses, and entity type
        columnHelper.accessor(
          (row: IdentityRow) =>
            [
              row.account?.contractName,
              row.account?.id,
              row.isContract === true
                ? "contract"
                : row.isContract === false
                  ? "account"
                  : "",
            ]
              .filter(Boolean)
              .join(" "),
          {
            id: "linkedEntity_filter",
            header: "", // Hidden column, no header needed
            enableHiding: false, // Prevent users from showing this column
            meta: {
              displayName: t("identityTable.columns.entity"),
              type: "text",
            },
          }
        ),
        // Visible display column for UI presentation
        // This column shows the rich Web3Address components with proper formatting
        // It cannot be used for filtering due to strict column helper constraints
        columnHelper.display({
          id: "linkedEntity",
          header: t("identityTable.columns.entity"),
          cell: ({ row }: CellContext<IdentityRow, unknown>) => {
            const { account, isContract } = row.original;

            if (!account) {
              return (
                <span className="text-muted-foreground">
                  {t("identityTable.fallback.noEntity")}
                </span>
              );
            }

            if (isContract === true) {
              return (
                <div className="flex flex-col gap-1">
                  {account.contractName && (
                    <span className="font-medium">{account.contractName}</span>
                  )}
                  <Web3Address
                    address={account.id}
                    size="small"
                    copyToClipboard
                    showBadge={!account.contractName}
                    showPrettyName={false}
                  />
                </div>
              );
            }

            return (
              <Web3Address
                address={account.id}
                size="small"
                copyToClipboard
                showBadge
                showPrettyName={false}
              />
            );
          },
          meta: {
            displayName: t("identityTable.columns.entity"),
            type: "none",
          },
        }),
        // Hidden accessor column for filtering by entity type
        columnHelper.accessor(
          (row: IdentityRow) =>
            row.isContract === true
              ? "contract"
              : row.isContract === false
                ? "account"
                : "",
          {
            id: "type_filter",
            header: "",
            enableHiding: false,
            meta: {
              displayName: t("identityTable.columns.type"),
              type: "option",
              options: [
                {
                  label: t("identityTable.types.account"),
                  value: "account",
                },
                {
                  label: t("identityTable.types.contract"),
                  value: "contract",
                },
              ],
            },
          }
        ),
        // Visible entity type column with distinctive brand colors
        columnHelper.display({
          id: "type",
          header: t("identityTable.columns.type"),
          cell: ({ row }: CellContext<IdentityRow, unknown>) => {
            const isContract = row.original.isContract;
            if (isContract === null || isContract === undefined) {
              return <span className="text-muted-foreground">—</span>;
            }
            return <IdentityTypeBadge isContract={isContract} />;
          },
          meta: {
            displayName: t("identityTable.columns.type"),
            type: "none",
          },
        }),
        columnHelper.display({
          id: "activeClaimsCount",
          header: t("identityTable.columns.activeClaims"),
          cell: ({ row }: CellContext<IdentityRow, unknown>) =>
            row.original.activeClaimsCount,
          meta: {
            displayName: t("identityTable.columns.activeClaims"),
            type: "number",
          },
        }),
        columnHelper.display({
          id: "revokedClaimsCount",
          header: t("identityTable.columns.revokedClaims"),
          cell: ({ row }: CellContext<IdentityRow, unknown>) =>
            row.original.revokedClaimsCount,
          meta: {
            displayName: t("identityTable.columns.revokedClaims"),
            type: "number",
          },
        }),
      ] as ColumnDef<IdentityRow>[]),
    [t]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {t("identityTable.errors.loadFailed")}
        </p>
      </div>
    );
  }

  return (
    <DataTable
      name="identity-management"
      data={items}
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
        enabled: false,
      }}
      advancedToolbar={{
        enableGlobalSearch: false,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
      }}
      pagination={{
        enablePagination: true,
      }}
      initialPageSize={20}
      // Hide the filter-only columns which are used for filtering functionality
      // The visible display columns handle the UI presentation
      initialColumnVisibility={{
        linkedEntity_filter: false,
        type_filter: false,
      }}
      customEmptyState={{
        title: t("identityTable.emptyState.title"),
        description: isLoading
          ? t("identityTable.emptyState.loading")
          : t("identityTable.emptyState.description"),
        icon: Fingerprint,
      }}
      onRowClick={handleRowClick}
    />
  );
}, "Identity Table");
