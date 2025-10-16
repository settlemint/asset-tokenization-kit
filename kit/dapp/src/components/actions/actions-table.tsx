"use client";

import { ActionStatusBadge } from "@/components/actions/action-status-badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnOption } from "@/components/data-table/filters/types/column-types";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { MatureConfirmationSheet } from "@/components/manage-dropdown/sheets/mature-confirmation-sheet";
import { RedeemSheet } from "@/components/manage-dropdown/sheets/redeem-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { useSession } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils/date";
import { getDateLocale } from "@/lib/utils/date-locale";
import { orpc } from "@/orpc/orpc-client";
import type {
  Action,
  ActionStatus,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type {
  ColumnDef,
  ColumnMeta,
  SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { from } from "dnum";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { getAddress } from "viem";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useTranslation } from "react-i18next";

const columnHelper = createStrictColumnHelper<Action>();

const ACTION_LABEL_MAP = {
  MatureBond: "labels.MatureBond",
  ApproveXvPSettlement: "labels.ApproveXvPSettlement",
  ExecuteXvPSettlement: "labels.ExecuteXvPSettlement",
  RedeemBond: "labels.RedeemBond",
} as const;

const ACTION_TYPE_MAP = {
  MatureBond: "bond",
  ApproveXvPSettlement: "settlement",
  ExecuteXvPSettlement: "settlement",
  RedeemBond: "bond",
} as const;

const UNKNOWN_ACTION_TYPE = "generic" as const;

type ActionTypeMetaValue =
  | (typeof ACTION_TYPE_MAP)[keyof typeof ACTION_TYPE_MAP]
  | typeof UNKNOWN_ACTION_TYPE;

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

export function ActionsTable({
  tableId,
  statuses,
  defaultSorting,
  actions,
  filterPredicate,
}: ActionsTableProps) {
  const { t, i18n } = useTranslation("actions");
  const router = useRouter();
  const { data: session } = useSession();
  const userWallet = session?.user?.wallet ?? null;
  const normalizedWallet = useMemo<EthereumAddress | null>(() => {
    if (!userWallet) return null;

    try {
      return getAddress(userWallet);
    } catch {
      return null;
    }
  }, [userWallet]);

  const [matureAction, setMatureAction] = useState<Action | null>(null);
  const [redeemAction, setRedeemAction] = useState<Action | null>(null);

  // Preload token data for sheets (hooks must be top-level and unconditional)
  const matureTokenQuery = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: matureAction?.target ?? "" },
      enabled: !!matureAction,
    })
  );

  const redeemTokenQuery = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: redeemAction?.target ?? "" },
      enabled: !!redeemAction,
    })
  );

  const redeemHolderQuery = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: redeemAction?.target ?? "",
        holderAddress: normalizedWallet ?? "",
      },
      enabled: !!redeemAction && !!normalizedWallet,
    })
  );

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
      if (!isKnownLabelAction(actionName)) {
        return toTitleCase(actionName);
      }

      const labelKey = ACTION_LABEL_MAP[actionName];
      return t(labelKey as never, {
        defaultValue: toTitleCase(actionName),
      });
    };

    const resolveTypeLabelFromValue = (typeValue: string): string => {
      const labelKey = `types.${typeValue}`;
      return t(labelKey as never, {
        defaultValue: toTitleCase(typeValue),
      });
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
    ].map((value) => ({
      value,
      label: resolveTypeLabelFromValue(value),
    }));

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
            label: resolveActionLabel(action),
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
        } satisfies ColumnMeta<Action, Action["name"]>,
      }),

      columnHelper.accessor(
        (row) =>
          isKnownTypeAction(row.name)
            ? ACTION_TYPE_MAP[row.name]
            : UNKNOWN_ACTION_TYPE,
        {
          id: "type",
          header: t("table.columns.type"),
          meta: {
            displayName: t("table.columns.type"),
            type: "option",
            options: typeLabelOptions,
            transformOptionFn: (value: unknown): ColumnOption => {
              const normalized: ActionTypeMetaValue =
                typeof value === "string" && value.trim().length > 0
                  ? (value as ActionTypeMetaValue)
                  : UNKNOWN_ACTION_TYPE;
              return {
                value: normalized,
                label: resolveTypeLabelFromValue(normalized),
              };
            },
            renderCell: ({ row }) => {
              return (
                <span className="text-sm text-muted-foreground">
                  {resolveTypeLabel(row.original.name)}
                </span>
              );
            },
          } satisfies ColumnMeta<Action, ActionTypeMetaValue>,
        }
      ),

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
            const executedDate = row.original.executedAt ?? null;
            const activeAt = row.original.activeAt;
            const dateLocale = getDateLocale(i18n.language);
            const relativeActive = formatDistanceToNow(activeAt, {
              addSuffix: true,
              locale: dateLocale,
            });

            return (
              <div className="flex flex-col gap-1">
                <ActionStatusBadge status={row.original.status} />
                {row.original.status === "PENDING" && (
                  <span className="text-xs text-muted-foreground">
                    {relativeActive}
                  </span>
                )}
                {row.original.status === "ACTIVE" && (
                  <span className="text-xs text-muted-foreground">
                    {relativeActive}
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

      columnHelper.accessor("activeAt", {
        id: "activeAt",
        header: t("table.columns.activeAt"),
        meta: {
          displayName: t("table.columns.activeAt"),
          type: "date",
          dateOptions: { relative: true },
          className: "text-muted-foreground",
        } satisfies ColumnMeta<Action, unknown>,
      }),

      columnHelper.accessor("executedAt", {
        id: "executedAt",
        header: t("table.columns.executedAt"),
        meta: {
          displayName: t("table.columns.executedAt"),
          type: "date",
          dateOptions: { includeTime: true },
          className: "text-muted-foreground",
          emptyValue: "—",
        } satisfies ColumnMeta<Action, unknown>,
      }),

      columnHelper.accessor("executedBy", {
        header: t("table.columns.executedBy"),
        meta: {
          displayName: t("table.columns.executedBy"),
          type: "address",
          showPrettyName: false,
          emptyValue: "—",
        } satisfies ColumnMeta<Action, unknown>,
      }),

      columnHelper.display({
        id: "execute",
        header: t("table.columns.execute"),
        meta: {
          displayName: t("table.columns.execute"),
          type: "none",
          enableCsvExport: false,
        } satisfies ColumnMeta<Action, unknown>,
        cell: ({ row }) => (
          <ExecuteActionButton
            action={row.original}
            actionLabel={resolveActionLabel(row.original.name)}
            onOpenMature={(a) => {
              setMatureAction(a);
            }}
            onOpenRedeem={(a) => {
              setRedeemAction(a);
            }}
          />
        ),
      }),
    ];

    return withAutoFeatures(baseColumns) as ColumnDef<Action>[];
  }, [t, i18n.language]);

  return (
    <>
      <DataTable
        name={`actions-${tableId}`}
        data={filteredActions}
        columns={columns}
        urlState={{
          enabled: true,
          enableUrlPersistence: true,
          routePath:
            router.state.matches.at(-1)?.pathname ??
            router.state.location.pathname,
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

      {matureAction ? (
        <MatureConfirmationSheet
          open={!!matureAction}
          onOpenChange={(open) => {
            setMatureAction(open ? matureAction : null);
          }}
          asset={matureTokenQuery.data as Token}
        />
      ) : null}

      {redeemAction
        ? (() => {
            const token = redeemTokenQuery.data;
            if (!token) return null;

            const zero = from(0n, token.decimals);
            const holderResult = redeemHolderQuery.data;

            const assetBalance: TokenBalance = {
              id: token.id,
              value: holderResult?.holder?.value ?? zero,
              frozen: holderResult?.holder?.frozen ?? zero,
              available: holderResult?.holder?.available ?? zero,
              token: {
                id: token.id,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                totalSupply: token.totalSupply,
              },
            };

            return (
              <RedeemSheet
                open={!!redeemAction}
                onClose={() => {
                  setRedeemAction(null);
                }}
                assetBalance={assetBalance}
                holderAddress={normalizedWallet}
              />
            );
          })()
        : null}
    </>
  );
}

interface ExecuteActionButtonProps {
  action: Action;
  actionLabel: string;
  onOpenMature: (action: Action) => void;
  onOpenRedeem: (action: Action) => void;
}

function ExecuteActionButton({
  action,
  actionLabel,
  onOpenMature,
  onOpenRedeem,
}: ExecuteActionButtonProps) {
  const { t } = useTranslation(["actions", "tokens", "common"]);

  const isMatureAction = action.name === "MatureBond";
  const isRedeemAction = action.name === "RedeemBond";
  const isSupportedAction = isMatureAction || isRedeemAction;
  const isActive = action.status === "ACTIVE";
  const activeAtTime =
    action.activeAt == null ? null : new Date(action.activeAt).getTime();
  const hasReachedSchedule =
    activeAtTime !== null &&
    Number.isFinite(activeAtTime) &&
    activeAtTime <= Date.now();
  // Allow execution once the scheduled time has passed, but only when a schedule exists,
  // so execution stays blocked for actions without an activation timestamp.
  const canExecute = isSupportedAction && (isActive || hasReachedSchedule);

  return (
    <Button
      size="sm"
      variant="secondary"
      className="press-effect"
      disabled={!canExecute}
      onClick={() => {
        if (!canExecute) return;
        if (isMatureAction) onOpenMature(action);
        else if (isRedeemAction) onOpenRedeem(action);
      }}
      aria-label={actionLabel}
    >
      {isSupportedAction
        ? t("actions:table.execute.label")
        : t("actions:table.execute.unavailable")}
    </Button>
  );
}
