"use client";

import { ActionStatusBadge } from "@/components/actions/action-status-badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnOption } from "@/components/data-table/filters/types/column-types";
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
import type {
  ColumnDef,
  ColumnMeta,
  SortingState,
} from "@tanstack/react-table";
import { ClipboardList } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const columnHelper = createStrictColumnHelper<Action>();

const ACTION_LABEL_MAP = {
  MatureBond: "labels.MatureBond",
  ApproveXvPSettlement: "labels.ApproveXvPSettlement",
  ExecuteXvPSettlement: "labels.ExecuteXvPSettlement",
} as const;

const ACTION_TYPE_MAP = {
  MatureBond: "bond",
  ApproveXvPSettlement: "settlement",
  ExecuteXvPSettlement: "settlement",
} as const;

const UNKNOWN_ACTION_TYPE = "generic" as const;

const ACTION_STATUSES: readonly ActionStatus[] = [
  "PENDING",
  "ACTIVE",
  "EXECUTED",
  "EXPIRED",
] as const;

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
    if (absMs >= unitMs) {
      const value = Math.round(diffMs / unitMs);
      return formatter.format(value, unit);
    }
  }

  // For sub-minute differences, avoid -0 by using the sign-aware approach
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

  const columns = useMemo(() => {
    const resolveActionLabel = (actionName: string): string => {
      const labelKey = isKnownLabelAction(actionName)
        ? ACTION_LABEL_MAP[actionName]
        : undefined;
      if (!labelKey) {
        return toTitleCase(actionName);
      }
      const translation = t(labelKey as never);
      return translation === labelKey ? toTitleCase(actionName) : translation;
    };

    const resolveTypeLabelFromValue = (typeValue: string): string => {
      const labelKey = `types.${typeValue}`;
      const translation = t(labelKey as never);
      return translation === labelKey ? toTitleCase(typeValue) : translation;
    };

    const resolveTypeLabel = (actionName: string): string => {
      if (isKnownTypeAction(actionName)) {
        return resolveTypeLabelFromValue(ACTION_TYPE_MAP[actionName]);
      }
      const fallbackTranslation =
        resolveTypeLabelFromValue(UNKNOWN_ACTION_TYPE);
      if (fallbackTranslation !== toTitleCase(UNKNOWN_ACTION_TYPE)) {
        return fallbackTranslation;
      }
      const fallback = actionName.split(/(?=[A-Z])/).at(-1) ?? actionName;
      return toTitleCase(fallback);
    };

    const typeLabelOptions: ColumnOption[] = [
      ...new Set([...Object.values(ACTION_TYPE_MAP), UNKNOWN_ACTION_TYPE]),
    ].map((value) => {
      const label = resolveTypeLabelFromValue(value);
      return { value: label, label };
    });

    const baseColumns = [
      columnHelper.accessor("name", {
        header: t("table.columns.name"),
        meta: {
          displayName: t("table.columns.name"),
          type: "option",
          options: (
            Object.keys(ACTION_LABEL_MAP) as Array<
              keyof typeof ACTION_LABEL_MAP
            >
          ).map((action) => ({
            value: action,
            label: t(ACTION_LABEL_MAP[action]),
          })),
          transformOptionFn: (value: unknown): ColumnOption => {
            const actionName = typeof value === "string" ? value : "";
            return {
              value: actionName,
              label: resolveActionLabel(actionName),
            };
          },
          renderCell: ({ row }) => {
            const actionName = row.original.name;
            const label = resolveActionLabel(actionName);
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
        } satisfies ColumnMeta<Action, string>,
      }),
      columnHelper.accessor((row) => resolveTypeLabel(row.name), {
        id: "type",
        header: t("table.columns.type"),
        meta: {
          displayName: t("table.columns.type"),
          type: "option",
          options: typeLabelOptions,
          transformOptionFn: (value: unknown): ColumnOption => {
            if (typeof value === "string" && value.trim().length > 0) {
              return { value, label: value };
            }
            const fallbackLabel =
              resolveTypeLabelFromValue(UNKNOWN_ACTION_TYPE);
            return {
              value: fallbackLabel,
              label: fallbackLabel,
            };
          },
        } satisfies ColumnMeta<Action, unknown>,
      }),
      columnHelper.accessor("status", {
        header: t("table.columns.status"),
        meta: {
          displayName: t("table.columns.status"),
          type: "status",
          options: ACTION_STATUSES.map((status) => ({
            value: status,
            label: t(`status.${status}`),
          })),
          renderCell: ({ row }) => {
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
        } satisfies ColumnMeta<Action, ActionStatus>,
      }),
      columnHelper.accessor(
        (row) => new Date(Number(row.activeAt) * 1000).toISOString(),
        {
          id: "activeAt",
          header: t("table.columns.activeAt"),
          meta: {
            displayName: t("table.columns.activeAt"),
            type: "date",
            dateOptions: { includeTime: true },
            className: "text-muted-foreground",
          } satisfies ColumnMeta<Action, unknown>,
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.executedAt
            ? new Date(Number(row.executedAt) * 1000).toISOString()
            : null,
        {
          id: "executedAt",
          header: t("table.columns.executedAt"),
          meta: {
            displayName: t("table.columns.executedAt"),
            type: "date",
            dateOptions: { includeTime: true },
            className: "text-muted-foreground",
            emptyValue: "—",
          } satisfies ColumnMeta<Action, unknown>,
        }
      ),
      columnHelper.accessor("executedBy", {
        header: t("table.columns.executedBy"),
        meta: {
          displayName: t("table.columns.executedBy"),
          type: "address",
          showPrettyName: false,
          emptyValue: "—",
        } satisfies ColumnMeta<Action, unknown>,
      }),
    ];

    return withAutoFeatures(baseColumns) as ColumnDef<Action>[];
  }, [t, i18n.language]);

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
