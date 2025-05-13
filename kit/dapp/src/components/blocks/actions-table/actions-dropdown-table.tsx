"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Action,
  ActionStatus,
} from "@/lib/queries/actions/actions-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { DataTablePaginationOptions } from "../data-table/data-table-pagination";
import type { DataTableToolbarOptions } from "../data-table/data-table-toolbar";
import { ActionsTable } from "./actions-table";

interface ActionsDropdownTableProps {
  actions: Action[];

  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

export function ActionsDropdownTable({
  actions,
  toolbar,
  pagination,
}: ActionsDropdownTableProps) {
  const t = useTranslations("actions");
  const [status, setStatus] = useState<ActionStatus>("PENDING");
  const counts = actions.reduce(
    (acc, action) => {
      acc[action.status] = (acc[action.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ActionStatus, number>
  );
  const statusOptions = [
    {
      value: "PENDING",
      label: t("status.PENDING"),
      count: counts.PENDING,
    },
    {
      value: "UPCOMING",
      label: t("status.UPCOMING"),
      count: counts.UPCOMING,
    },
    {
      value: "COMPLETED",
      label: t("status.COMPLETED"),
      count: counts.COMPLETED,
    },
    {
      value: "EXPIRED",
      label: t("status.EXPIRED"),
      count: counts.EXPIRED,
    },
  ];
  const handleStatusChange = (newStatus: ActionStatus) => {
    setStatus(newStatus);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Select
          value={status}
          onValueChange={(value) => handleStatusChange(value as ActionStatus)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue defaultValue={t("status.PENDING")} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.count > 0 && (
                    <Badge variant="outline" className="ml-2 border-card">
                      {option.count}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ActionsTable
        status={status}
        actions={actions}
        toolbar={toolbar}
        pagination={pagination}
      />
    </div>
  );
}
