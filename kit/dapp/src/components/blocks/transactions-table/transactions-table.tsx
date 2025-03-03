import { DataTable } from "@/components/blocks/data-table/data-table";
import { columns } from "@/components/blocks/transactions-table/transactions-table-columns";
import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import type { Address } from "viem";
import { icons } from "./transactions-table-columns";

interface TransactionsTableProps {
  from?: Address;
}

export default async function TransactionsTable({
  from,
}: TransactionsTableProps) {
  const transactions = await getRecentTransactions({
    address: from,
  });

  return (
    <DataTable
      columns={columns}
      data={transactions}
      icons={icons}
      name={"Transactions"}
    />
  );
}
