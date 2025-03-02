import { DataTable } from "@/components/blocks/data-table/data-table";
import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import type { Address } from "viem";
import { icons, useTransactionsColumns } from "./transactions-table-columns";

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
      columnHook={useTransactionsColumns}
      data={transactions}
      icons={icons}
      name={"Transactions"}
    />
  );
}
