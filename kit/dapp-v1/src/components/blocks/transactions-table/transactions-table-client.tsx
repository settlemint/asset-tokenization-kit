"use client";
import { DataTable } from "@/components/blocks/data-table/data-table";
import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import { ClockFadingIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Columns, icons } from "./transactions-table-columns";

interface TransactionsTableClientProps {
  transactions: Awaited<ReturnType<typeof getRecentTransactions>>;
}

export default function TransactionsTableClient({
  transactions,
}: TransactionsTableClientProps) {
  const t = useTranslations("components.transactions-table");

  return (
    <DataTable
      columns={Columns}
      data={transactions}
      icons={icons}
      name={t("title")}
      customEmptyState={{
        icon: ClockFadingIcon,
        title: t("empty-state.title"),
        description: t("empty-state.description"),
      }}
    />
  );
}
