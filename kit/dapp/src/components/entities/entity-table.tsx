import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { Web3TransactionHash } from "@/components/web3/web3-transaction-hash";
import { orpc } from "@/orpc/orpc-client";
import type { EntityListOutput } from "@/orpc/routes/system/entity/routes/entity.list.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { CellContext, ColumnDef } from "@tanstack/table-core";
import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { isEthereumHash } from "@atk/zod/ethereum-hash";
import { EntityTypeLabels } from "@atk/zod/entity-types";

type EntityRow = EntityListOutput["items"][number];

const columnHelper = createStrictColumnHelper<EntityRow>();

type EntityStatus = EntityRow["status"];

function EntityStatusBadge({ status }: { status: EntityStatus }) {
  const { t } = useTranslation("identities");
  const isRegistered = status === "registered";
  const labelKey = isRegistered ? "status.registered" : "status.pending";
  return (
    <Badge
      variant={isRegistered ? "default" : "outline"}
      className={isRegistered ? "bg-green-500 hover:bg-green-600" : undefined}
    >
      {t(labelKey)}
    </Badge>
  );
}

function EntityTypeBadge({
  entityType,
}: {
  entityType: EntityRow["entityType"];
}) {
  const { t } = useTranslation("identities");
  if (!entityType) {
    return (
      <span className="text-muted-foreground">
        {t("entityTable.fallback.noType", { defaultValue: "Unknown" })}
      </span>
    );
  }

  const fallbackLabel =
    typeof entityType === "string" && entityType in EntityTypeLabels
      ? EntityTypeLabels[entityType]
      : entityType;
  const label = t(`entityTable.types.${entityType}`, {
    defaultValue: fallbackLabel,
  });

  return <Badge variant="secondary">{label}</Badge>;
}

export const EntityTable = withErrorBoundary(function EntityTable() {
  const router = useRouter();
  const { t } = useTranslation("identities");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, error } = useQuery(
    orpc.system.entity.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy: "lastActivity",
        orderDirection: "desc",
      },
    })
  );

  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  const handleRowClick = async (entity: EntityRow) => {
    try {
      await router.navigate({
        to: "/participants/entities/$address",
        params: { address: entity.id },
      });
    } catch {
      toast.error(
        t("entityTable.errors.navigationFailed", {
          defaultValue: t("identityTable.errors.navigationFailed"),
        })
      );
    }
  };

  const columns = useMemo(() => {
    const entityTypeOptions = Object.entries(EntityTypeLabels).map(
      ([value, label]) => ({
        value,
        label: t(`entityTable.types.${value}`, { defaultValue: label }),
      })
    );

    return withAutoFeatures([
      columnHelper.accessor("id", {
        id: "entityIdentity",
        header: t("entityTable.columns.identity", {
          defaultValue: t("identityTable.columns.id"),
        }),
        meta: {
          displayName: t("entityTable.columns.identity", {
            defaultValue: t("identityTable.columns.id"),
          }),
          type: "address",
          addressOptions: {
            showPrettyName: false,
          },
        },
      }),
      columnHelper.accessor(
        (row) =>
          [
            row.contractName,
            row.contractAddress,
            row.id,
            row.entityType,
            row.status,
          ]
            .filter(Boolean)
            .join(" "),
        {
          id: "entity_filter",
          header: "",
          enableHiding: false,
          meta: {
            displayName: t("entityTable.columns.entity", {
              defaultValue: t("identityTable.columns.entity"),
            }),
            type: "text",
          },
        }
      ),
      columnHelper.display({
        id: "entity",
        header: t("entityTable.columns.entity", {
          defaultValue: t("identityTable.columns.entity"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) => {
          const { contractName, contractAddress, id } = row.original;
          const targetAddress = getEthereumAddress(contractAddress ?? id);

          return (
            <div className="flex flex-col gap-1">
              {contractName ? (
                <span className="font-medium">{contractName}</span>
              ) : (
                <span className="text-muted-foreground">
                  {t("entityTable.fallback.noEntity", {
                    defaultValue: t("identityTable.fallback.noEntity"),
                  })}
                </span>
              )}
              <Web3Address
                address={targetAddress}
                size="tiny"
                showPrettyName={!contractName}
              />
            </div>
          );
        },
        meta: {
          displayName: t("entityTable.columns.entity", {
            defaultValue: t("identityTable.columns.entity"),
          }),
          type: "none",
        },
      }),
      columnHelper.display({
        id: "entityType",
        header: t("entityTable.columns.type", {
          defaultValue: t("identityTable.columns.type"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) => (
          <EntityTypeBadge entityType={row.original.entityType} />
        ),
        meta: {
          displayName: t("entityTable.columns.type", {
            defaultValue: t("identityTable.columns.type"),
          }),
          type: "option",
          options: entityTypeOptions,
        },
      }),
      columnHelper.display({
        id: "status",
        header: t("entityTable.columns.status", {
          defaultValue: t("table.columns.status"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) => (
          <EntityStatusBadge status={row.original.status} />
        ),
        meta: {
          displayName: t("entityTable.columns.status", {
            defaultValue: t("table.columns.status"),
          }),
          type: "option",
          options: [
            {
              value: "registered",
              label: t("status.registered"),
            },
            {
              value: "pending",
              label: t("status.pending"),
            },
          ],
        },
      }),
      columnHelper.display({
        id: "activeClaimsCount",
        header: t("entityTable.columns.activeClaims", {
          defaultValue: t("identityTable.columns.activeClaims"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) =>
          row.original.activeClaimsCount,
        meta: {
          displayName: t("entityTable.columns.activeClaims", {
            defaultValue: t("identityTable.columns.activeClaims"),
          }),
          type: "number",
        },
      }),
      columnHelper.display({
        id: "revokedClaimsCount",
        header: t("entityTable.columns.revokedClaims", {
          defaultValue: t("identityTable.columns.revokedClaims"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) =>
          row.original.revokedClaimsCount,
        meta: {
          displayName: t("entityTable.columns.revokedClaims", {
            defaultValue: t("identityTable.columns.revokedClaims"),
          }),
          type: "number",
        },
      }),
      columnHelper.display({
        id: "lastActivity",
        header: t("entityTable.columns.lastActivity", {
          defaultValue: t("identityTable.columns.deployment"),
        }),
        cell: ({ row }: CellContext<EntityRow, unknown>) => {
          const { deployedInTransaction } = row.original;
          if (
            !deployedInTransaction ||
            !isEthereumHash(deployedInTransaction)
          ) {
            return (
              <span className="text-muted-foreground">
                {t("entityTable.fallback.noActivity", {
                  defaultValue: t("identityTable.fallback.noDeployment"),
                })}
              </span>
            );
          }

          return (
            <Web3TransactionHash
              hash={deployedInTransaction}
              copyToClipboard
              showFullHash={false}
            />
          );
        },
        meta: {
          displayName: t("entityTable.columns.lastActivity", {
            defaultValue: t("identityTable.columns.deployment"),
          }),
          type: "text",
        },
      }),
    ]) as ColumnDef<EntityRow>[];
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {t("entityTable.errors.loadFailed", {
            defaultValue: t("identityTable.errors.loadFailed"),
          })}
        </p>
      </div>
    );
  }

  return (
    <DataTable
      name="entity-management"
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
        enableGlobalSearch: true,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
      }}
      pagination={{
        enablePagination: true,
      }}
      initialPageSize={20}
      initialColumnVisibility={{
        entity_filter: false,
      }}
      customEmptyState={{
        title: t("entityTable.emptyState.title", {
          defaultValue: t("identityTable.emptyState.title"),
        }),
        description: isLoading
          ? t("entityTable.emptyState.loading", {
              defaultValue: t("identityTable.emptyState.loading"),
            })
          : t("entityTable.emptyState.description", {
              defaultValue: t("identityTable.emptyState.description"),
            }),
        icon: Building2,
      }}
      onRowClick={handleRowClick}
    />
  );
});
