import { AutoCell } from "@/components/data-table/cells/auto-cell";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActionUserType } from "@/lib/constants/action-types";
import { orpc } from "@/orpc";
import type {
  ActionStatus,
  TokenAction,
} from "@/orpc/routes/token/routes/token.actions.schema";
import { ActionStatusEnum } from "@/orpc/routes/token/routes/token.actions.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AlarmClockCheck,
  ArrowBigRightDash,
  CircleDashed,
  ExternalLink,
  Info,
  ListCheck,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Use centralized action types
export type ActionType = ActionUserType;

// Use the TokenAction type directly since server now returns proper types
export interface Action {
  id: string;
  name: string;
  type: ActionType;
  status: ActionStatus; // Server-computed status
  createdAt: Date; // UTC timestamp
  activeAt: Date; // UTC timestamp
  expiresAt: Date | null; // UTC timestamp
  executedAt: Date | null; // UTC timestamp
  executed: boolean;
  target: {
    id: string;
  };
  executedBy: {
    id: string;
  } | null;
}

// No conversion needed - server returns proper types
function convertTokenActionToAction(tokenAction: TokenAction): Action {
  return tokenAction as Action;
}

export interface ActionsTableProps {
  status: ActionStatus;
  type: ActionType;
}

const columnHelper = createColumnHelper<Action>();

// Status is now computed server-side - no client calculation needed
function getActionStatus(action: Action): ActionStatus {
  return action.status;
}

function ActionStatusIndicator({ action }: { action: Action }) {
  const { t } = useTranslation("issuer-dashboard");
  const status = getActionStatus(action);

  const statusConfig = {
    [ActionStatusEnum.enum.PENDING]: {
      icon: ListCheck,
      label: t("actionsTable.status.pending"),
      variant: "default" as const,
    },
    [ActionStatusEnum.enum.UPCOMING]: {
      icon: ArrowBigRightDash,
      label: t("actionsTable.status.upcoming"),
      variant: "secondary" as const,
    },
    [ActionStatusEnum.enum.COMPLETED]: {
      icon: CircleDashed,
      label: t("actionsTable.status.completed"),
      variant: "outline" as const,
    },
    [ActionStatusEnum.enum.EXPIRED]: {
      icon: AlarmClockCheck,
      label: t("actionsTable.status.expired"),
      variant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

/**
 * Actions table component for the dashboard
 */
export function ActionsTable({ status, type }: ActionsTableProps) {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch actions from the API with a hard limit of 50
  const { data: tokenActions } = useSuspenseQuery(
    orpc.token.actions.queryOptions({
      input: {
        status,
        type,
        offset: 0,
        limit: 50,
      },
    })
  );

  // Convert API response to component format
  const actions: Action[] = useMemo(() => {
    return tokenActions.map(convertTokenActionToAction);
  }, [tokenActions]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("actionsTable.columns.actionName"),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{getValue()}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("actionsTable.tooltip.action", {
                      actionName: getValue(),
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      }),
      columnHelper.accessor("target.id", {
        header: t("actionsTable.columns.target"),
        cell: ({ getValue }) => (
          <div className="font-mono text-sm">
            {getValue().slice(0, 6)}...{getValue().slice(-4)}
          </div>
        ),
      }),
      columnHelper.accessor("activeAt", {
        header: t("actionsTable.columns.activeAt"),
        meta: {
          type: "date",
          displayName: t("actionsTable.columns.activeAt"),
        },
        cell: (context) => <AutoCell context={context} />,
      }),
      columnHelper.display({
        id: "status",
        header: t("actionsTable.columns.status"),
        cell: ({ row }) => <ActionStatusIndicator action={row.original} />,
      }),
      ...(status === ActionStatusEnum.enum.PENDING
        ? [
            columnHelper.display({
              id: "actions",
              header: t("actionsTable.columns.actions"),
              cell: () => (
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("actionsTable.buttons.execute")}
                </Button>
              ),
            }),
          ]
        : []),
    ],
    [status, t]
  );

  // Actions are already filtered by the API call, so we can use them directly
  const filteredActions = actions;

  const statusConfig = {
    [ActionStatusEnum.enum.PENDING]: {
      icon: ListCheck,
      title: t("actionsTable.emptyStates.pending.title"),
      description: t("actionsTable.emptyStates.pending.description"),
    },
    [ActionStatusEnum.enum.UPCOMING]: {
      icon: ArrowBigRightDash,
      title: t("actionsTable.emptyStates.upcoming.title"),
      description: t("actionsTable.emptyStates.upcoming.description"),
    },
    [ActionStatusEnum.enum.COMPLETED]: {
      icon: CircleDashed,
      title: t("actionsTable.emptyStates.completed.title"),
      description: t("actionsTable.emptyStates.completed.description"),
    },
    [ActionStatusEnum.enum.EXPIRED]: {
      icon: AlarmClockCheck,
      title: t("actionsTable.emptyStates.expired.title"),
      description: t("actionsTable.emptyStates.expired.description"),
    },
  } as const;

  return (
    <DataTable
      columns={columns}
      data={filteredActions}
      name={`Actions-${status}-${type}`}
      customEmptyState={statusConfig[status]}
      initialPageSize={10}
    />
  );
}
