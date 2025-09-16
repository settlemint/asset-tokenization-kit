import { DataTable } from "@/components/data-table/data-table";
import type { FilterValue } from "@/components/data-table/filters/types/filter-types";
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
import type { CellContext, ColumnDef, Row } from "@tanstack/table-core";
import { Fingerprint } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type IdentityRow = IdentityListOutput["items"][number];
type EntityKind = "account" | "contract";

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

  const handleRowClick = (identity: IdentityRow) => {
    void (async () => {
      try {
        await router.navigate({
          to: "/admin/identity-management/$accountId",
          params: { accountId: identity.account?.id ?? identity.id },
        });
      } catch {
        toast.error(t("identityTable.errors.navigationFailed"));
      }
    })();
  };

  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "identity",
          header: t("identityTable.columns.id"),
          cell: ({ row }: CellContext<IdentityRow, unknown>) => {
            const identity = row.original;
            const kind: EntityKind = identity.contract ? "contract" : "account";
            const typeLabel = t(
              kind === "contract"
                ? "identityTable.types.contract"
                : "identityTable.types.account"
            );

            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{typeLabel}</Badge>
                  <Web3Address
                    address={identity.id}
                    size="small"
                    copyToClipboard
                    showPrettyName={false}
                  />
                </div>
                {identity.contract?.contractName ? (
                  <span className="text-muted-foreground text-xs">
                    {identity.contract.contractName}
                  </span>
                ) : null}
              </div>
            );
          },
          filterFn: (
            row: Row<IdentityRow>,
            _columnId: string,
            filterValue: string | string[] | FilterValue<"text", IdentityRow>
          ) => {
            if (!filterValue) return true;

            const haystack = [
              row.original.id,
              row.original.account?.id,
              row.original.contract?.id,
              row.original.contract?.contractName,
            ]
              .filter(Boolean)
              .map((value) => value?.toLowerCase() ?? "")
              .join(" ");

            const evaluate = (query: string) => {
              if (!query) return true;
              const normalized = query.toLowerCase();
              return haystack.includes(normalized);
            };

            if (typeof filterValue === "string") {
              return evaluate(filterValue);
            }

            if (Array.isArray(filterValue)) {
              return filterValue.every((value) =>
                typeof value === "string" ? evaluate(value) : true
              );
            }

            const values = filterValue.values ?? [];
            const term = values[0]?.toLowerCase() ?? "";
            if (!term) return true;
            const match = haystack.includes(term);
            return filterValue.operator === "does not contain" ? !match : match;
          },
          meta: {
            displayName: t("identityTable.columns.id"),
            type: "address",
            enableColumnFilter: true,
          },
        }),
        columnHelper.accessor(
          (row: IdentityRow) =>
            (row.contract ? "contract" : "account") as EntityKind,
          {
            id: "type",
            header: t("identityTable.columns.type"),
            cell: ({ getValue }: CellContext<IdentityRow, EntityKind>) => {
              const kind = getValue();
              const label = t(
                kind === "contract"
                  ? "identityTable.types.contract"
                  : "identityTable.types.account"
              );
              return <Badge variant="outline">{label}</Badge>;
            },
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
              enableColumnFilter: true,
            },
          }
        ),
        columnHelper.accessor(
          (row: IdentityRow) =>
            [
              row.contract?.contractName,
              row.contract?.id,
              row.account?.id,
              row.contract ? "contract" : undefined,
              row.account ? "account" : undefined,
            ]
              .filter((value): value is string => Boolean(value))
              .join(" "),
          {
            id: "linkedEntity",
            header: t("identityTable.columns.linkedEntity"),
            cell: ({ row }: CellContext<IdentityRow, string>) => {
              const { contract, account } = row.original;

              if (contract) {
                return (
                  <div className="flex flex-col gap-1">
                    {contract.contractName && (
                      <span className="font-medium">
                        {contract.contractName}
                      </span>
                    )}
                    <Web3Address
                      address={contract.id}
                      size="tiny"
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
                    size="tiny"
                    copyToClipboard
                    showBadge
                    showPrettyName={false}
                  />
                );
              }

              const fallbackKey =
                contract === null && account === null
                  ? "noEntity"
                  : contract === null
                    ? "noContract"
                    : "noAccount";

              return (
                <span className="text-muted-foreground text-sm">
                  {t(`identityTable.fallback.${fallbackKey}`)}
                </span>
              );
            },
            meta: {
              displayName: t("identityTable.columns.linkedEntity"),
              type: "text",
              enableColumnFilter: true,
            },
          }
        ),
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
