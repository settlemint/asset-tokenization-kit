"use client";

import type { DataTablePaginationOptions } from "@/components/blocks/data-table/data-table-pagination";
import type { DataTableToolbarOptions } from "@/components/blocks/data-table/data-table-toolbar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Action,
  ActionStatus,
} from "@/lib/queries/actions/actions-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClockCheck,
  ArrowBigRightDash,
  CircleDashed,
  ListCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTable } from "../data-table/data-table";
import { Columns } from "./actions-columns";

export interface ActionsClientTableProps {
  status: ActionStatus;
  actions: Action[];
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

/**
 * Component that renders actions in a table
 */
export function ActionsClientTable({
  status,
  actions,
  toolbar,
  pagination,
}: ActionsClientTableProps) {
  const t = useTranslations("actions");

  let emptyState;
  switch (status) {
    case "PENDING": {
      emptyState = (
        <EmptyState
          icon={ListCheck}
          title={t("tabs.empty-state.title.pending")}
          description={t("tabs.empty-state.description.pending")}
        />
      );
      break;
    }
    case "UPCOMING": {
      emptyState = (
        <EmptyState
          icon={ArrowBigRightDash}
          title={t("tabs.empty-state.title.upcoming")}
          description={t("tabs.empty-state.description.upcoming")}
        />
      );
      break;
    }
    case "COMPLETED": {
      emptyState = (
        <EmptyState
          icon={CircleDashed}
          title={t("tabs.empty-state.title.completed")}
          description={t("tabs.empty-state.description.completed")}
        />
      );
      break;
    }
    case "EXPIRED": {
      emptyState = (
        <EmptyState
          icon={AlarmClockCheck}
          title={t("tabs.empty-state.title.expired")}
          description={t("tabs.empty-state.description.expired")}
        />
      );
      break;
    }
    default:
      exhaustiveGuard(status);
  }

  const filteredActions = actions.filter((action) => action.status === status);
  if (filteredActions.length === 0) {
    return emptyState;
  }

  return (
    <DataTable
      columns={Columns}
      columnParams={{ status }}
      data={filteredActions}
      name="Actions"
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Icon className="size-5" />
          <div>{title}</div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
