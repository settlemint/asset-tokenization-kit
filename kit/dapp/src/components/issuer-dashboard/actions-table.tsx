import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/orpc";
import type { TokenAction } from "@/orpc/routes/token/routes/token.actions.schema";
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

// Define the action types based on the schema
export type ActionStatus = "PENDING" | "UPCOMING" | "COMPLETED" | "EXPIRED";
export type ActionType = "Admin" | "User";

// Use the TokenAction type from the schema but convert string dates to Date objects for UI
export interface Action {
  id: string;
  name: string;
  type: ActionType;
  createdAt: Date;
  activeAt: Date;
  expiresAt: Date | null;
  executedAt: Date | null;
  executed: boolean;
  target: {
    id: string;
  };
  executedBy: {
    id: string;
  } | null;
}

// Helper function to convert TokenAction to Action (string dates to Date objects)
function convertTokenActionToAction(tokenAction: TokenAction): Action {
  return {
    ...tokenAction,
    createdAt: new Date(tokenAction.createdAt),
    activeAt: new Date(tokenAction.activeAt),
    expiresAt: tokenAction.expiresAt ? new Date(tokenAction.expiresAt) : null,
    executedAt: tokenAction.executedAt ? new Date(tokenAction.executedAt) : null,
  };
}

export interface ActionsTableProps {
  status: ActionStatus;
  type: ActionType;
}

const columnHelper = createColumnHelper<Action>();

function calculateActionStatus(action: Action): ActionStatus {
  const now = new Date();

  if (action.executed) {
    return "COMPLETED";
  }

  if (action.expiresAt && action.expiresAt < now) {
    return "EXPIRED";
  }

  if (action.activeAt > now) {
    return "UPCOMING";
  }

  return "PENDING";
}

function ActionStatusIndicator({ action }: { action: Action }) {
  const { t } = useTranslation("issuer-dashboard");
  const status = calculateActionStatus(action);

  const statusConfig = {
    PENDING: {
      icon: ListCheck,
      label: t("actionsTable.status.pending"),
      variant: "default" as const,
    },
    UPCOMING: {
      icon: ArrowBigRightDash,
      label: t("actionsTable.status.upcoming"),
      variant: "secondary" as const,
    },
    COMPLETED: {
      icon: CircleDashed,
      label: t("actionsTable.status.completed"),
      variant: "outline" as const,
    },
    EXPIRED: {
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
  
  // Fetch actions from the API
  const { data: tokenActions } = useSuspenseQuery(
    orpc.token.actions.queryOptions({
      input: {
        status,
        type,
        limit: 1000, // Get all actions for now
      },
    })
  );

  // Convert API response to component format
  const actions: Action[] = useMemo(() => {
    return tokenActions.map(convertTokenActionToAction);
  }, [tokenActions]);

  const columns = useMemo(() => [
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
                <p>{t("actionsTable.tooltip.action", { actionName: getValue() })}</p>
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
      cell: ({ getValue }) => (
        <div className="text-sm">
          {getValue().toLocaleDateString()}
        </div>
      ),
    }),
    columnHelper.display({
      id: "status",
      header: t("actionsTable.columns.status"),
      cell: ({ row }) => <ActionStatusIndicator action={row.original} />,
    }),
    ...(status === "PENDING"
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
  ], [status, t]);

  // Actions are already filtered by the API call, so we can use them directly
  const filteredActions = actions;

  const statusConfig = {
    PENDING: {
      icon: ListCheck,
      title: t("actionsTable.emptyStates.pending.title"),
      description: t("actionsTable.emptyStates.pending.description"),
    },
    UPCOMING: {
      icon: ArrowBigRightDash,
      title: t("actionsTable.emptyStates.upcoming.title"),
      description: t("actionsTable.emptyStates.upcoming.description"),
    },
    COMPLETED: {
      icon: CircleDashed,
      title: t("actionsTable.emptyStates.completed.title"),
      description: t("actionsTable.emptyStates.completed.description"),
    },
    EXPIRED: {
      icon: AlarmClockCheck,
      title: t("actionsTable.emptyStates.expired.title"),
      description: t("actionsTable.emptyStates.expired.description"),
    },
  } as const;

  const columnsCallback = useMemo(() => () => columns, [columns]);

  return (
    <DataTable
      columns={columnsCallback}
      data={filteredActions}
      name="Actions"
      customEmptyState={statusConfig[status]}
    />
  );
}