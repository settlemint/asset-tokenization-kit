import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { IdentityStatusBadge } from "@/components/identity/identity-status-badge";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { EntityListOutput } from "@/orpc/routes/system/entity/routes/entity.list.schema";
import { entityTypes } from "@atk/zod/entity-types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Building2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type EntityRow = EntityListOutput["items"][number];

const columnHelper = createStrictColumnHelper<EntityRow>();

export const EntityTable = withErrorBoundary(function EntityTable() {
  const router = useRouter();
  const { t } = useTranslation(["entities", "identities"]);
  const isNavigatingRef = useRef(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortColumnMap = useMemo(
    () => ({
      identityAddress: "identityAddress",
      lastActivity: "lastActivity",
    }),
    []
  );

  const isSortableColumn = useCallback(
    (columnId: string): columnId is keyof typeof sortColumnMap =>
      columnId in sortColumnMap,
    [sortColumnMap]
  );

  const activeSorting = sorting[0];
  const orderBy =
    activeSorting && isSortableColumn(activeSorting.id)
      ? sortColumnMap[activeSorting.id]
      : "lastActivity";
  const orderDirection: "asc" | "desc" =
    activeSorting && !activeSorting.desc ? "asc" : "desc";

  const { data, isLoading, error } = useQuery(
    orpc.system.entity.list.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy,
        orderDirection,
      },
    })
  );

  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  const handleRowClick = useCallback(
    async (entity: EntityRow) => {
      if (isNavigatingRef.current) {
        return;
      }

      isNavigatingRef.current = true;

      try {
        await router.navigate({
          to: "/participants/entities/$address",
          params: { address: entity.id },
        });
      } catch {
        toast.error(t("entityTable.errors.navigationFailed"));
      } finally {
        isNavigatingRef.current = false;
      }
    },
    [router, t]
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((previous) =>
        typeof updater === "function" ? updater(previous) : updater
      );
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    },
    [setPagination]
  );

  const externalState = useMemo(
    () => ({
      pagination,
      sorting,
      onPaginationChange: setPagination,
      onSortingChange: handleSortingChange,
    }),
    [handleSortingChange, pagination, setPagination, sorting]
  );

  const columns = useMemo(() => {
    const entityTypeOptions = entityTypes.map((type) => {
      const translationKey = `entityTable.types.${type}` as const;
      return {
        value: type,
        label: t(translationKey),
      };
    });

    return withAutoFeatures([
      columnHelper.accessor("contractName", {
        id: "name",
        header: t("entityTable.columns.name"),
        meta: {
          displayName: t("entityTable.columns.name"),
          type: "text",
          emptyValue: t("entityTable.fallback.noName"),
        },
      }),
      columnHelper.accessor("contractAddress", {
        id: "contractAddress",
        header: t("entityTable.columns.address"),
        meta: {
          displayName: t("entityTable.columns.address"),
          type: "address",
          emptyValue: t("entityTable.fallback.noContractAddress"),
          addressOptions: {
            size: "tiny",
            showPrettyName: false,
          },
        },
      }),
      columnHelper.accessor("id", {
        id: "identityAddress",
        header: t("entityTable.columns.identityAddress"),
        enableSorting: true,
        meta: {
          displayName: t("entityTable.columns.identityAddress"),
          type: "address",
          emptyValue: t("entityTable.fallback.noIdentity"),
          addressOptions: {
            size: "tiny",
            showPrettyName: false,
          },
        },
      }),
      columnHelper.accessor("entityType", {
        id: "entityType",
        header: t("entityTable.columns.type"),
        meta: {
          displayName: t("entityTable.columns.type"),
          type: "option",
          options: entityTypeOptions,
          renderCell: ({ getValue }) => {
            const type = getValue();

            if (!type) {
              return (
                <span className="text-muted-foreground">
                  {t("entityTable.fallback.unknown")}
                </span>
              );
            }

            return (
              <Badge variant="outline">{t(`entityTable.types.${type}`)}</Badge>
            );
          },
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: t("entityTable.columns.status"),
        meta: {
          displayName: t("entityTable.columns.status"),
          type: "option",
          options: [
            {
              value: "registered",
              label: t("identities:status.registered"),
            },
            {
              value: "pending",
              label: t("identities:status.pendingRegistration"),
            },
          ],
          renderCell: ({ getValue }) => {
            const status = getValue();

            return (
              <IdentityStatusBadge isRegistered={status === "registered"} />
            );
          },
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
      externalState={externalState}
      urlState={{
        enabled: true,
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
