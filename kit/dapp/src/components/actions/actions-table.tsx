"use client";

import { ActionStatusBadge } from "@/components/actions/action-status-badge";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { formatDate } from "@/lib/utils/date";
import type {
  Action,
  ActionStatus,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";

const columnHelper = createStrictColumnHelper<Action>();

const ACTION_LABEL_MAP = {
  MatureBond: "labels.MatureBond",
  ApproveXvPSettlement: "labels.ApproveXvPSettlement",
  ExecuteXvPSettlement: "labels.ExecuteXvPSettlement",
} as const;

const ACTION_TYPE_MAP = {
  MatureBond: "types.bond",
  ApproveXvPSettlement: "types.settlement",
  ExecuteXvPSettlement: "types.settlement",
} as const;

function isKnownLabelAction(
  name: string
): name is keyof typeof ACTION_LABEL_MAP {
  return Object.prototype.hasOwnProperty.call(ACTION_LABEL_MAP, name);
}

function isKnownTypeAction(name: string): name is keyof typeof ACTION_TYPE_MAP {
  return Object.prototype.hasOwnProperty.call(ACTION_TYPE_MAP, name);
}

interface ActionsTableProps {
  tableId: string;
  statuses: readonly ActionStatus[];
  defaultSorting: SortingState;
  actions: Action[];
  /**
   * Optional function to limit the dataset (e.g. completed actions need executedAt)
   */
  filterPredicate?: (action: Action) => boolean;
}

function toTitleCase(input: string): string {
  return input
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll(/[_-]+/g, " ")
    .trim();
}

function formatRelative(date: Date, locale: string): string {
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  for (const [unit, unitMs] of units) {
    if (absMs >= unitMs || unit === "minute") {
      const value = Math.round(diffMs / unitMs);
      return formatter.format(value, unit);
    }
  }

  return formatter.format(0, "minute");
}

export function ActionsTable({
  tableId,
  statuses,
  defaultSorting,
  actions,
  filterPredicate,
}: ActionsTableProps) {
  const { t, i18n } = useTranslation("actions");
  const router = useRouter();

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      if (filterPredicate && !filterPredicate(action)) {
        return false;
      }

      return statuses.includes(action.status);
    });
  }, [actions, filterPredicate, statuses]);

  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "name",
          header: t("table.columns.name"),
          cell: ({ row }) => {
            const labelKey = isKnownLabelAction(row.original.name)
              ? ACTION_LABEL_MAP[row.original.name]
              : undefined;
            const label = labelKey
              ? t(labelKey)
              : toTitleCase(row.original.name);
            const authorizedCount = row.original.executor.executors.length;

            return (
              <div className="flex flex-col gap-1">
                <span className="font-medium leading-tight">{label}</span>
                <Web3Address
                  address={row.original.target}
                  copyToClipboard
                  size="small"
                  showPrettyName={false}
                  skipDataQueries
                />
                <Badge variant="outline" className="w-fit text-xs">
                  {t("table.authorizedBadge", { count: authorizedCount })}
                </Badge>
              </div>
            );
          },
          meta: {
            displayName: t("table.columns.name"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "type",
          header: t("table.columns.type"),
          cell: ({ row }) => {
            const typeKey = isKnownTypeAction(row.original.name)
              ? ACTION_TYPE_MAP[row.original.name]
              : undefined;
            const typeLabel = typeKey
              ? t(typeKey)
              : toTitleCase(
                  row.original.name.split(/(?=[A-Z])/).at(-1) ??
                    row.original.name
                );

            return (
              <span className="text-sm text-muted-foreground">{typeLabel}</span>
            );
          },
          meta: {
            displayName: t("table.columns.type"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("table.columns.status"),
          cell: ({ row }) => {
            const executedAt = row.original.executedAt;
            const activeAt = new Date(Number(row.original.activeAt) * 1000);
            const executedDate =
              executedAt === null ? null : new Date(Number(executedAt) * 1000);

            return (
              <div className="flex flex-col gap-1">
                <ActionStatusBadge status={row.original.status} />
                {row.original.status === "PENDING" && (
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(activeAt, i18n.language)}
                  </span>
                )}
                {row.original.status === "ACTIVE" && (
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(activeAt, i18n.language)}
                  </span>
                )}
                {row.original.status === "EXECUTED" && executedDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(
                      executedDate,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                      i18n.language
                    )}
                  </span>
                )}
              </div>
            );
          },
          meta: {
            displayName: t("table.columns.status"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "activeAt",
          header: t("table.columns.activeAt"),
          cell: ({ row }) => {
            const date = new Date(Number(row.original.activeAt) * 1000);

            return (
              <span className="text-sm text-muted-foreground">
                {formatDate(
                  date,
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                  i18n.language
                )}
              </span>
            );
          },
          meta: {
            displayName: t("table.columns.activeAt"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "executedAt",
          header: t("table.columns.executedAt"),
          cell: ({ row }) => {
            if (!row.original.executedAt) {
              return <span className="text-sm text-muted-foreground">—</span>;
            }

            const date = new Date(Number(row.original.executedAt) * 1000);

            return (
              <span className="text-sm text-muted-foreground">
                {formatDate(
                  date,
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                  i18n.language
                )}
              </span>
            );
          },
          meta: {
            displayName: t("table.columns.executedAt"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "executedBy",
          header: t("table.columns.executedBy"),
          cell: ({ row }) => {
            if (!row.original.executedBy) {
              return <span className="text-sm text-muted-foreground">—</span>;
            }

            return (
              <Web3Address
                address={row.original.executedBy}
                copyToClipboard
                size="small"
                showPrettyName={false}
                skipDataQueries
              />
            );
          },
          meta: {
            displayName: t("table.columns.executedBy"),
            type: "text",
          },
        }),
      ] as ColumnDef<Action>[]),
    [t, i18n.language]
  );

  return (
    <DataTable
      name={`actions-${tableId}`}
      data={filteredActions}
      columns={columns}
      urlState={{
        enabled: true,
        enableUrlPersistence: true,
        routePath: router.state.matches.at(-1)?.pathname,
        defaultPageSize: 10,
        enableGlobalFilter: true,
      }}
      initialSorting={defaultSorting}
      advancedToolbar={{
        enableGlobalSearch: true,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
        placeholder: t("filters.searchPlaceholder"),
      }}
      pagination={{ enablePagination: true }}
      customEmptyState={{
        icon: ClipboardList,
        title: t("table.empty.title"),
        description: t("table.empty.description"),
      }}
    />
  );
}
