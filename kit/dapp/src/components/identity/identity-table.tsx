import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
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

export function IdentityTable() {
  const router = useRouter();
  const { t } = useTranslation("claims");
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
        to: "/admin/identity-management/$accountId",
        params: { accountId: identity.account?.id ?? identity.id },
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
          cell: ({ row }: CellContext<IdentityRow, string>) => (
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
              row.contract?.contractName,
              row.contract?.id,
              row.account?.id,
              row.contract ? "contract" : undefined,
              row.account ? "account" : undefined,
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
            const { contract, account } = row.original;

            if (contract) {
              return (
                <div className="flex flex-col gap-1">
                  {contract.contractName && (
                    <span className="font-medium">{contract.contractName}</span>
                  )}
                  <Web3Address
                    address={contract.id}
                    size="small"
                    copyToClipboard
                    showBadge={!contract.contractName}
                    showPrettyName={false}
                  />
                </div>
              );
            }

            if (account) {
              return (
                <Web3Address
                  address={account.id}
                  size="small"
                  copyToClipboard
                  showBadge
                  showPrettyName={false}
                />
              );
            }

            return (
              <span className="text-muted-foreground text-sm">
                {t(`identityTable.fallback.noEntity`)}
              </span>
            );
          },
          meta: {
            displayName: t("identityTable.columns.entity"),
            type: "none",
          },
        }),
        // Hidden accessor column for filtering by entity type
        columnHelper.accessor(
          (row: IdentityRow) => (row.contract ? "contract" : "account"),
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
            const isContract = !!row.original.contract;
            const label = t(
              isContract
                ? "identityTable.types.contract"
                : "identityTable.types.account"
            );

            // Use SettleMint brand colors for distinction
            const brandColorClasses = isContract
              ? "bg-[oklch(0.7675_0.0982_182.83)]/20 text-[oklch(0.7675_0.0982_182.83)] border-[oklch(0.7675_0.0982_182.83)]/30"
              : "bg-sm-accent/20 text-sm-accent border-sm-accent/30";

            return (
              <Badge variant="outline" className={brandColorClasses}>
                {label}
              </Badge>
            );
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
      <ComponentErrorBoundary componentName="Identity Table">
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            {t("identityTable.errors.loadFailed")}
          </p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Identity Table">
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
    </ComponentErrorBoundary>
  );
}
