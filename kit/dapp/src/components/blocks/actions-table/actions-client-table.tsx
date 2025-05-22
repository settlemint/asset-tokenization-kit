"use client";

import type { DataTablePaginationOptions } from "@/components/blocks/data-table/data-table-pagination";
import type { DataTableToolbarOptions } from "@/components/blocks/data-table/data-table-toolbar";
import { calculateActionStatus } from "@/lib/queries/actions/action-status";
import type {
  Action,
  ActionStatus,
} from "@/lib/queries/actions/actions-schema";
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

  const statusConfig = {
    PENDING: {
      icon: ListCheck,
      title: t("tabs.empty-state.title.pending"),
      description: t("tabs.empty-state.description.pending"),
    },
    UPCOMING: {
      icon: ArrowBigRightDash,
      title: t("tabs.empty-state.title.upcoming"),
      description: t("tabs.empty-state.description.upcoming"),
    },
    COMPLETED: {
      icon: CircleDashed,
      title: t("tabs.empty-state.title.completed"),
      description: t("tabs.empty-state.description.completed"),
    },
    EXPIRED: {
      icon: AlarmClockCheck,
      title: t("tabs.empty-state.title.expired"),
      description: t("tabs.empty-state.description.expired"),
    },
  } as const;

  const filteredActions = actions.filter(
    (action) => calculateActionStatus(action) === status
  );

  return (
    <DataTable
      columns={Columns}
      columnParams={{ status }}
      data={filteredActions}
      name="Actions"
      toolbar={toolbar}
      pagination={pagination}
      customEmptyState={statusConfig[status]}
    />
  );
}
