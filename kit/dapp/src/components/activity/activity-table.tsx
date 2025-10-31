import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Web3TransactionHash } from "@/components/web3/web3-transaction-hash";
import { cn } from "@/lib/utils";
import { formatEventName } from "@/lib/utils/format-event-name";
import { orpc } from "@/orpc/orpc-client";
import type { UserEvent } from "@/orpc/routes/user/routes/user.events.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { History } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type EVENT_CONFIG_REGISTRY,
  getEventCategory,
  getEventStatus,
} from "../dashboard/latest-events/utils/event-config";

type ActivityRow = UserEvent;

const columnHelper = createStrictColumnHelper<ActivityRow>();

export const ActivityTable = withErrorBoundary(function ActivityTable() {
  const { t } = useTranslation(["activity", "dashboard"]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const sortColumnMap = useMemo(
    () =>
      ({
        blockTimestamp: "blockTimestamp",
        eventName: "eventName",
        blockNumber: "blockNumber",
      }) as const,
    []
  );

  const isSortableColumn = useCallback(
    (columnId: string): columnId is keyof typeof sortColumnMap =>
      columnId in sortColumnMap,
    [sortColumnMap]
  );

  const activeSorting = sorting[0];
  const orderBy: "blockTimestamp" | "eventName" | "blockNumber" =
    activeSorting && isSortableColumn(activeSorting.id)
      ? sortColumnMap[activeSorting.id]
      : "blockTimestamp";
  const orderDirection: "asc" | "desc" =
    activeSorting && !activeSorting.desc ? "asc" : "desc";

  const { data, isLoading, error } = useSuspenseQuery(
    orpc.user.events.queryOptions({
      input: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy,
        orderDirection,
      },
    })
  );

  const items = data?.events ?? [];
  const totalCount = data?.total ?? 0;

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
    return withAutoFeatures([
      columnHelper.accessor("eventName", {
        id: "eventName",
        header: t("activity:table.columns.eventName"),
        enableSorting: true,
        meta: {
          displayName: t("activity:table.columns.eventName"),
          type: "text",
          renderCell: ({ getValue }) => {
            const eventName = getValue();
            const status = getEventStatus(
              eventName as keyof typeof EVENT_CONFIG_REGISTRY
            );
            const Icon = status.icon;

            const eventDisplayName =
              t(`dashboard:widgets.latestEvents.types.${eventName}`, {
                defaultValue: eventName,
              }) ?? formatEventName(eventName);

            return (
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center">
                  <Icon
                    className={cn("size-4", status.iconClassName)}
                    aria-hidden
                  />
                </div>
                <span className="font-medium">{eventDisplayName}</span>
              </div>
            );
          },
        },
      }),
      columnHelper.accessor(
        (row) =>
          getEventCategory(row.eventName as keyof typeof EVENT_CONFIG_REGISTRY)
            .name,
        {
          id: "category",
          header: t("activity:table.columns.category"),
          meta: {
            displayName: t("activity:table.columns.category"),
            type: "text",
            renderCell: ({ row }) => {
              const category = getEventCategory(
                row.original.eventName as keyof typeof EVENT_CONFIG_REGISTRY
              );
              return (
                <Badge variant={category.variant} className="text-xs">
                  {t(
                    `dashboard:widgets.latestEvents.${category.translationKey}`,
                    {
                      defaultValue: category.name,
                    }
                  )}
                </Badge>
              );
            },
          },
        }
      ),
      columnHelper.accessor("sender.id", {
        id: "sender",
        header: t("activity:table.columns.sender"),
        meta: {
          displayName: t("activity:table.columns.sender"),
          type: "address",
          emptyValue: t("activity:table.fallback.noSender"),
          addressOptions: {
            size: "tiny",
            showPrettyName: false,
          },
        },
      }),
      columnHelper.accessor("transactionHash", {
        id: "transactionHash",
        header: t("activity:table.columns.transactionHash"),
        meta: {
          displayName: t("activity:table.columns.transactionHash"),
          type: "text",
          renderCell: ({ getValue }) => {
            const hash = getValue();
            return (
              <Web3TransactionHash
                hash={hash}
                showFullHash={false}
                copyToClipboard
              />
            );
          },
        },
      }),
      columnHelper.accessor("blockNumber", {
        id: "blockNumber",
        header: t("activity:table.columns.blockNumber"),
        enableSorting: true,
        meta: {
          displayName: t("activity:table.columns.blockNumber"),
          type: "text",
          renderCell: ({ getValue }) => {
            const blockNumber = getValue();
            return <span className="font-mono text-xs">{blockNumber}</span>;
          },
        },
      }),
      columnHelper.accessor("blockTimestamp", {
        id: "blockTimestamp",
        header: t("activity:table.columns.timestamp"),
        enableSorting: true,
        meta: {
          displayName: t("activity:table.columns.timestamp"),
          type: "date",
          dateOptions: { relative: true },
        },
      }),
    ]) as ColumnDef<ActivityRow>[];
  }, [t]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {t("activity:table.errors.loadFailed")}
        </p>
      </div>
    );
  }

  return (
    <DataTable
      name="activity-table"
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
      customEmptyState={{
        title: t("activity:table.emptyState.title"),
        description: t("activity:table.emptyState.description"),
        icon: History,
      }}
    />
  );
});
