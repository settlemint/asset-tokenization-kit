"use client";

import { ActionStatusBadge } from "@/components/actions/action-status-badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnOption } from "@/components/data-table/filters/types/column-types";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Badge } from "@/components/ui/badge";
import { VerificationButton } from "@/components/verification-dialog/verification-button";
import { Web3Address } from "@/components/web3/web3-address";
import { isORPCError } from "@/hooks/use-error-info";
import { formatDate } from "@/lib/utils/date";
import { getDateLocale } from "@/lib/utils/date-locale";
import { orpc } from "@/orpc/orpc-client";
import type {
  Action,
  ActionStatus,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type {
  ColumnDef,
  ColumnMeta,
  SortingState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
          />
        ),
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
  );
}

interface ExecuteActionButtonProps {
  action: Action;
  actionLabel: string;
}

function ExecuteActionButton({
  action,
  actionLabel,
}: ExecuteActionButtonProps) {
  const { t } = useTranslation(["actions", "tokens", "common"]);
  const queryClient = useQueryClient();

  const isMatureAction = action.name === "MatureBond";
  const isRedeemAction = action.name === "RedeemBond";
  const isSupportedAction = isMatureAction || isRedeemAction;
  const isActive = action.status === "ACTIVE";
  const activeAtTime = new Date(action.activeAt).getTime();
  const hasReachedSchedule =
    Number.isFinite(activeAtTime) && activeAtTime <= Date.now();
  // Allow execution once the scheduled time has passed even if status reconciliation lags.
  const canExecute = isSupportedAction && (isActive || hasReachedSchedule);

  const matureMutation = useMutation(
    orpc.token.mature.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.actions.list.queryKey({ input: {} }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: orpc.actions.list.queryKey({
            input: { target: action.target },
          }),
        });

        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.queryKey({
            input: { tokenAddress: action.target },
          }),
        });
      },
    })
  );

  const redeemMutation = useMutation(
    orpc.token.redeem.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.actions.list.queryKey({ input: {} }),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.actions.list.queryKey({
              input: { target: action.target },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.read.queryKey({
              input: { tokenAddress: action.target },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.user.assets.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.holders.queryKey({
              input: { tokenAddress: action.target },
            }),
          }),
        ]);
      },
    })
  );

  const currentMutation = isMatureAction
    ? matureMutation
    : isRedeemAction
      ? redeemMutation
      : null;
  const isMutationPending = currentMutation?.isPending ?? false;

  const formatErrorMessage = (error: unknown): string => {
    if (isORPCError(error) && error.code === "USER_NOT_AUTHORIZED") {
      return t("actions:execute.errors.notAuthorized");
    }

    const message =
      error instanceof Error
        ? error.message
        : t("common:errors.somethingWentWrong");

    return t("common:error", { message });
  };

  const handleExecute = async (verification: UserVerification) => {
    if (!isSupportedAction) {
      const message = t("actions:execute.errors.unsupported");
      toast.info(message);
      throw new Error(message);
    }

    let execution: Promise<unknown>;

    if (isMatureAction) {
      execution = matureMutation.mutateAsync({
        contract: action.target,
        walletVerification: verification,
      });
    } else if (isRedeemAction) {
      execution = redeemMutation.mutateAsync({
        contract: action.target,
        walletVerification: verification,
        redeemAll: true,
      });
    } else {
      const message = t("actions:execute.errors.unsupported");
      toast.info(message);
      throw new Error(message);
    }

    toast.promise(execution, {
      loading: t("actions:execute.messages.loading", {
        action: actionLabel,
      }),
      success: t("actions:execute.messages.success", {
        action: actionLabel,
      }),
      error: (error) => formatErrorMessage(error),
    });

    // Note: We rethrow here to signal failure to `VerificationButton` so the
    // verification dialog stays open and can show an inline error message.
    // `toast.promise` handles user-facing toasts, but the rejection is still
    // required for the dialog flow. This is handled (not unhandled) upstream.
    try {
      await execution;
    } catch (error) {
      throw new Error(formatErrorMessage(error));
    }
  };

  const triggerDisabled = !canExecute || isMutationPending;

  return (
    <VerificationButton
      disabled={triggerDisabled}
      buttonProps={{
        size: "sm",
        variant: "secondary",
        className: "press-effect",
        disabled: triggerDisabled,
      }}
      walletVerification={{
        title: t("tokens:actions.mature.title"),
        description: t("tokens:actions.mature.description"),
      }}
      onSubmit={handleExecute}
    >
      {isMutationPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          {t("actions:table.execute.loading")}
        </span>
      ) : isSupportedAction ? (
        t("actions:table.execute.label")
      ) : (
        t("actions:table.execute.unavailable")
      )}
    </VerificationButton>
  );
}
