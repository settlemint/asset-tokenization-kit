import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import type { Address } from "viem";
import TransactionsTableClient from "./transactions-table-client";

interface TransactionsTableProps {
  from?: Address;
}

export default async function TransactionsTable({
  from,
}: TransactionsTableProps) {
  const transactions = await getRecentTransactions({
    address: from,
  });

  return <TransactionsTableClient transactions={transactions} />;
}
