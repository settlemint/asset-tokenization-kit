"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  AlarmClockCheck,
  ArrowBigRightDash,
  CircleDashed,
  ListCheck,
  Info,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { TokenAction } from "@/orpc/routes/token/routes/token.actions.schema";

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
  const status = calculateActionStatus(action);
  
  const statusConfig = {
    PENDING: {
      icon: ListCheck,
      label: "Pending",
      variant: "default" as const,
    },
    UPCOMING: {
      icon: ArrowBigRightDash,
      label: "Upcoming",
      variant: "secondary" as const,
    },
    COMPLETED: {
      icon: CircleDashed,
      label: "Completed",
      variant: "outline" as const,
    },
    EXPIRED: {
      icon: AlarmClockCheck,
      label: "Expired",
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
      header: "Action Name",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{getValue()}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Action: {getValue()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    }),
    columnHelper.accessor("target.id", {
      header: "Target",
      cell: ({ getValue }) => (
        <div className="font-mono text-sm">
          {getValue().slice(0, 6)}...{getValue().slice(-4)}
        </div>
      ),
    }),
    columnHelper.accessor("activeAt", {
      header: "Active At",
      cell: ({ getValue }) => (
        <div className="text-sm">
          {getValue().toLocaleDateString()}
        </div>
      ),
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => <ActionStatusIndicator action={row.original} />,
    }),
    ...(status === "PENDING"
      ? [
          columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: () => (
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Execute
              </Button>
            ),
          }),
        ]
      : []),
  ], [status]);
  
  // Actions are already filtered by the API call, so we can use them directly
  const filteredActions = actions;
  
  const statusConfig = {
    PENDING: {
      icon: ListCheck,
      title: "No pending actions",
      description: "You don't have any actions that require your attention at this time.",
    },
    UPCOMING: {
      icon: ArrowBigRightDash,
      title: "No upcoming actions",
      description: "There are no actions scheduled for the future.",
    },
    COMPLETED: {
      icon: CircleDashed,
      title: "No completed actions",
      description: "No actions have been completed yet.",
    },
    EXPIRED: {
      icon: AlarmClockCheck,
      title: "No expired actions",
      description: "There are no expired actions.",
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