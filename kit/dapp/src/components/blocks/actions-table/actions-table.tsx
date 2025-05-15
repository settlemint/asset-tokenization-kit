import { getUser } from "@/lib/auth/utils";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type {
  ActionStatus,
  ActionType,
} from "@/lib/queries/actions/actions-schema";
import type { DataTablePaginationOptions } from "../data-table/data-table-pagination";
import type { DataTableToolbarOptions } from "../data-table/data-table-toolbar";
import { ActionsClientTable } from "./actions-client-table";

interface ActionsTableProps {
  status: ActionStatus;
  type: ActionType;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
}

/**
 * Component that renders actions in a table
 */
export async function ActionsTable({
  status,
  type,
  toolbar,
  pagination,
}: ActionsTableProps) {
  const user = await getUser();
  const actionsList = await getActionsList({
    status,
    userAddress: user.wallet,
    type,
  });

  return (
    <ActionsClientTable
      status={status}
      actions={actionsList}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
