"use client";

import { getUser } from "@/lib/auth/utils";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import { ActionType } from "@/lib/queries/actions/actions-schema";
import type { Address } from "viem";
import type { DataTablePaginationOptions } from "../data-table/data-table-pagination";
import type { DataTableToolbarOptions } from "../data-table/data-table-toolbar";
import { ActionsDropdownClientTable } from "./actions-dropdown-client-table";

interface ActionsDropdownTableProps {
  type: ActionType;
  targetAddress?: Address;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

export async function ActionsDropdownTable({
  type,
  targetAddress,
  toolbar,
  pagination,
}: ActionsDropdownTableProps) {
  const user = await getUser();
  const actionsList = await getActionsList({
    userAddress: user.wallet,
    type,
    targetAddress,
  });
  return (
    <ActionsDropdownClientTable
      actions={actionsList}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
