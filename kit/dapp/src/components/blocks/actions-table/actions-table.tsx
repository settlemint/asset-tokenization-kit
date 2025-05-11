import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUser } from "@/lib/auth/utils";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type { ActionType } from "@/lib/queries/actions/actions-schema";
import { Columns } from "./actions-columns";

interface ActionsTableProps {
  state: "pending" | "executed" | "upcoming";
  actionType: ActionType;
}

/**
 * Server component that fetches data and passes it to the client component
 */
export async function ActionsTable({ state, actionType }: ActionsTableProps) {
  const user = await getUser();

  const actions = await getActionsList({
    userAddress: user.wallet,
    executed: state === "executed",
    active:
      state === "pending" ? true : state === "upcoming" ? false : undefined,
    actionType,
  });

  return (
    <DataTable
      columns={Columns}
      columnParams={{ state }}
      data={actions}
      name="Actions"
    />
  );
}
