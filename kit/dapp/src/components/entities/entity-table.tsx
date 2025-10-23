import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
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
import { EntityTypeLabels } from "@atk/zod/entity-types";

type EntityRow = EntityListOutput["items"][number];

const columnHelper = createStrictColumnHelper<EntityRow>();

type EntityStatus = EntityRow["status"];

function EntityStatusBadge({ status }: { status: EntityStatus }) {
  const { t } = useTranslation("entities");
  const isRegistered = status === "registered";
  const labelKey = isRegistered ? "status.registered" : "status.pending";
  return (
    <Badge variant={isRegistered ? "default" : "outline"}>{t(labelKey)}</Badge>
  );
}

function EntityTypeBadge({
  entityType,
}: {
  entityType: EntityRow["entityType"];
}) {
  const { t } = useTranslation("entities");
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

  return <Badge variant="outline">{label}</Badge>;
}

export const EntityTable = withErrorBoundary(function EntityTable() {
  const router = useRouter();
  const { t } = useTranslation("entities");
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
      toast.error(t("entityTable.errors.navigationFailed"));
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
            displayName: t("entityTable.columns.name"),
            type: "text",
          },
        }
      ),
      columnHelper.display({
        id: "name",
        header: t("entityTable.columns.name"),
        cell: ({ row }: CellContext<EntityRow, unknown>) => {
          const { contractName } = row.original;
          if (!contractName) {
            return (
              <span className="text-muted-foreground">
                {t("entityTable.fallback.noName")}
              </span>
            );
          }

          return <span className="font-medium">{contractName}</span>;
        },
        meta: {
          displayName: t("entityTable.columns.name"),
          type: "text",
          emptyValue: t("entityTable.fallback.noName"),
        },
      }),
      columnHelper.display({
        id: "contractAddress",
        header: t("entityTable.columns.address"),
        cell: ({ row }: CellContext<EntityRow, unknown>) => {
          const { contractAddress } = row.original;
          if (!contractAddress) {
            return (
              <span className="text-muted-foreground">
                {t("entityTable.fallback.noContractAddress")}
              </span>
            );
          }

          return (
            <Web3Address
              address={getEthereumAddress(contractAddress)}
              size="tiny"
              showPrettyName={false}
            />
          );
        },
        meta: {
          displayName: t("entityTable.columns.address"),
          type: "address",
          emptyValue: t("entityTable.fallback.noContractAddress"),
        },
      }),
      columnHelper.display({
        id: "identityAddress",
        header: t("entityTable.columns.identityAddress"),
        cell: ({ row }: CellContext<EntityRow, unknown>) => (
          <Web3Address
            address={row.original.id}
            size="tiny"
            showPrettyName={false}
          />
        ),
        meta: {
          displayName: t("entityTable.columns.identityAddress"),
          type: "address",
          emptyValue: t("entityTable.fallback.noIdentity"),
        },
      }),
      columnHelper.display({
        id: "entityType",
        header: t("entityTable.columns.type"),
        cell: ({ row }: CellContext<EntityRow, unknown>) => (
          <EntityTypeBadge entityType={row.original.entityType} />
        ),
        meta: {
          displayName: t("entityTable.columns.type"),
          type: "option",
          options: entityTypeOptions,
        },
      }),
      columnHelper.display({
        id: "status",
        header: t("entityTable.columns.status"),
        cell: ({ row }: CellContext<EntityRow, unknown>) => (
          <EntityStatusBadge status={row.original.status} />
        ),
        meta: {
          displayName: t("entityTable.columns.status"),
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
    ]) as ColumnDef<EntityRow>[];
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {t("entityTable.errors.loadFailed")}
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
        title: t("entityTable.emptyState.title"),
        description: isLoading
          ? t("entityTable.emptyState.loading")
          : t("entityTable.emptyState.description"),
        icon: Building2,
      }}
      onRowClick={handleRowClick}
    />
  );
});
