"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { TransactionHash } from "@/components/blocks/transaction-hash/transaction-hash";
import type { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TransactionDetailSheet } from "./transaction-table-detail-sheet";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof getRecentTransactions>>[number]
  >();

export function Columns() {
  const t = useTranslations("components.transactions-table");
  const locale = useLocale();

  return [
    columnHelper.accessor("receipt.status", {
      id: "status",
      header: t("columns.status"),
      cell: ({ getValue }) => {
        const status = getValue();
        const Icon =
          status === "Success"
            ? icons.success
            : status === "Reverted"
              ? icons.failed
              : icons.pending;
        return (
          <div className="flex items-center gap-2">
            <Icon
              className={
                status === "Success"
                  ? "text-success"
                  : status === "Reverted"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
              size={18}
            />
            <span>{status}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("columns.created-at"),
      cell: ({ getValue }) => formatDate(getValue() ?? new Date(), { locale }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("functionName", {
      header: t("columns.function"),
    }),
    columnHelper.accessor("from", {
      header: t("columns.from"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.accessor("address", {
      header: t("columns.contract"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.accessor("transactionHash", {
      header: t("columns.transaction-hash"),
      cell: ({ getValue }) => <TransactionHash hash={getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: t("columns.actions"),
      cell: ({ row }) => (
        <TransactionDetailSheet
          address={row.original.address}
          createdAt={row.original.createdAt}
          from={row.original.from}
          functionName={row.original.functionName}
          transactionHash={row.original.transactionHash}
          updatedAt={row.original.updatedAt}
          receipt={row.original.receipt}
        />
      ),
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}

export const icons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};
