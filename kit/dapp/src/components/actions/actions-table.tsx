"use client";

import { ActionStatusBadge } from "@/components/actions/action-status-badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnOption } from "@/components/data-table/filters/types/column-types";

import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ClaimYieldSheet } from "@/components/manage-dropdown/sheets/claim-yield-sheet";
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
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type {
  ColumnDef,
  ColumnMeta,
  SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAddress } from "viem";

const columnHelper = createStrictColumnHelper<Action>();

const ACTION_LABEL_MAP = {
  MatureBond: "labels.MatureBond",
  ApproveXvPSettlement: "labels.ApproveXvPSettlement",
  ExecuteXvPSettlement: "labels.ExecuteXvPSettlement",
  RedeemBond: "labels.RedeemBond",
  ClaimYield: "labels.ClaimYield",
} as const;

const ACTION_TYPE_MAP = {
  MatureBond: "bond",
  ApproveXvPSettlement: "settlement",
  ExecuteXvPSettlement: "settlement",
  RedeemBond: "bond",
  ClaimYield: "bond",
} as const;

const UNKNOWN_ACTION_TYPE = "generic" as const;

type ActionTypeMetaValue =
  | (typeof ACTION_TYPE_MAP)[keyof typeof ACTION_TYPE_MAP]
  | typeof UNKNOWN_ACTION_TYPE;

function isKnownLabelAction(
  name: string
): name is keyof typeof ACTION_LABEL_MAP {
  return Object.prototype.hasOwnProperty.call(ACTION_LABEL_MAP, name);
}

enum ActionType {
  MatureBond = "MatureBond",
  RedeemBond = "RedeemBond",
  ClaimYield = "ClaimYield",
  ApproveXvPSettlement = "ApproveXvPSettlement",
  ExecuteXvPSettlement = "ExecuteXvPSettlement",
}

function isKnownTypeAction(name: string): name is ActionType {
  return ActionType[name as keyof typeof ActionType] !== undefined;
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

  const [selectedTarget, setSelectedTarget] = useState<EthereumAddress | null>(
    null
  );
  const [selectedActionType, setSelectedActionType] =
    useState<ActionType | null>(null);

  // Preload token data for sheets (hooks must be top-level and unconditional)
  const tokenQuery = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: selectedTarget ?? "" },
      enabled: !!selectedTarget && !!selectedActionType,
    })
  );

  const holderQuery = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: selectedTarget ?? "",
        holderAddress: normalizedWallet ?? "",
      },
      enabled:
        !!selectedTarget &&
        selectedActionType === ActionType.RedeemBond &&
        !!normalizedWallet,
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
                <Web3Address address={row.original.target} size="tiny" />
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
          },
        }
      ),

      // We use display here because we dont allow filtering or sorting by status
      // The actions are already filtered by status (by using tabs), makes no sense if there is only one possible value
      columnHelper.display({
        id: "status",
        header: t("table.columns.status"),
        meta: {
          displayName: t("table.columns.status"),
          type: "status",
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
                {row.original.status !== "EXECUTED" && (
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
        },
      }),

      columnHelper.accessor("activeAt", {
        id: "activeAt",
        header: t("table.columns.activeAt"),
        meta: {
          displayName: t("table.columns.activeAt"),
          type: "date",
          dateOptions: { relative: true, includeTime: true },
          className: "text-muted-foreground",
        },
      }),

      columnHelper.accessor("expiresAt", {
        id: "expiresAt",
        header: t("table.columns.expiresAt"),
        meta: {
          displayName: t("table.columns.expiresAt"),
          type: "date",
          dateOptions: { includeTime: true },
          className: "text-muted-foreground",
          emptyValue: "—",
        },
      }),
    ] as ColumnDef<Action>[];

    if (statuses.includes("EXECUTED")) {
      baseColumns.push(
        columnHelper.accessor("executedAt", {
          id: "executedAt",
          header: t("table.columns.executedAt"),
          meta: {
            displayName: t("table.columns.executedAt"),
            type: "date",
            dateOptions: { includeTime: true },
            className: "text-muted-foreground",
            emptyValue: "—",
          },
        }) as ColumnDef<Action>,
        columnHelper.accessor("executedBy", {
          header: t("table.columns.executedBy"),
          meta: {
            displayName: t("table.columns.executedBy"),
            type: "address",
            emptyValue: "—",
          },
        }) as ColumnDef<Action>
      );
    }

    if (statuses.includes("PENDING")) {
      baseColumns.push(
        columnHelper.display({
          id: "execute",
          header: t("table.columns.execute"),
          meta: {
            displayName: t("table.columns.execute"),
            type: "none",
            enableCsvExport: false,
          },
          cell: ({ row }) => (
            <ExecuteActionButton
              action={row.original}
              actionLabel={resolveActionLabel(row.original.name)}
              onOpen={(target, actionType) => {
                setSelectedTarget(target);
                setSelectedActionType(actionType);
              }}
            />
          ),
        })
      );
    }

    return withAutoFeatures(baseColumns);
  }, [t, i18n.language, statuses]);

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

      {selectedTarget && tokenQuery.data ? (
        <MatureConfirmationSheet
          open={selectedActionType === ActionType.MatureBond}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedActionType(null);
              setSelectedTarget(null);
            }
          }}
          asset={tokenQuery.data}
        />
      ) : null}

      {selectedTarget && tokenQuery.data
        ? (() => {
            const token = tokenQuery.data;
            const holderResult = holderQuery.data;
            if (!token || !holderResult || !holderResult.holder) return null;

            const assetBalance: TokenBalance = {
              id: token.id,
              value: holderResult.holder.value,
              frozen: holderResult.holder.frozen,
              available: holderResult.holder.available,
              token: {
                id: token.id,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                totalSupply: token.totalSupply,
                yield: null,
              },
            };

            return (
              <RedeemSheet
                open={selectedActionType === ActionType.RedeemBond}
                onClose={() => {
                  setSelectedActionType(null);
                  setSelectedTarget(null);
                }}
                assetBalance={assetBalance}
                holderAddress={normalizedWallet}
              />
            );
          })()
        : null}

      {selectedTarget && tokenQuery.data
        ? (() => {
            const token = tokenQuery.data;

            return (
              <ClaimYieldSheet
                open={selectedActionType === ActionType.ClaimYield}
                onClose={() => {
                  setSelectedActionType(null);
                  setSelectedTarget(null);
                }}
                assetBalance={{
                  token,
                }}
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
  onOpen: (target: EthereumAddress, actionType: ActionType) => void;
}

function ExecuteActionButton({
  action,
  actionLabel,
  onOpen,
}: ExecuteActionButtonProps) {
  const { t } = useTranslation(["actions", "tokens", "common"]);

  const isSupportedAction = isKnownTypeAction(action.name);
  const isPending = action.status === "PENDING";
  const canExecute = isSupportedAction && isPending;

  return (
    <Button
      size="sm"
      variant="secondary"
      className="press-effect"
      disabled={!canExecute}
      onClick={() => {
        if (!canExecute) return;
        onOpen(action.target, action.name as ActionType);
      }}
      aria-label={actionLabel}
    >
      {isSupportedAction
        ? t("actions:table.execute.label")
        : t("actions:table.execute.unavailable")}
    </Button>
  );
}
