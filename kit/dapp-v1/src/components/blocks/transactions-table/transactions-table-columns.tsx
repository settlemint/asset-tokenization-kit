"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { TransactionHash } from "@/components/blocks/transaction-hash/transaction-hash";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import {
  CheckCircle,
  Clock,
  CodeIcon,
  CreditCard,
  Hash,
  MoreHorizontal,
  User2Icon,
  XCircle,
} from "lucide-react";
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
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.receipt?.status || "Pending", {
        displayName: t("columns.status"),
        icon: Clock,
        type: "option",
        options: [
          { label: "Success", value: "Success" },
          { label: "Reverted", value: "Reverted" },
          { label: "Pending", value: "Pending" },
        ],
      }),
    }),
    columnHelper.accessor("createdAt", {
      header: t("columns.created-at"),
      cell: ({ getValue }) => formatDate(getValue() ?? new Date(), { locale }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("functionName", {
      header: t("columns.function"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.functionName, {
        displayName: t("columns.function"),
        icon: CodeIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("from", {
      header: t("columns.from"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.from, {
        displayName: t("columns.from"),
        icon: User2Icon,
        type: "text",
      }),
    }),
    columnHelper.accessor("address", {
      header: t("columns.contract"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.address, {
        displayName: t("columns.contract"),
        icon: CreditCard,
        type: "text",
      }),
    }),
    columnHelper.accessor("transactionHash", {
      header: t("columns.transaction-hash"),
      cell: ({ getValue }) => <TransactionHash hash={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.transactionHash, {
        displayName: t("columns.transaction-hash"),
        icon: Hash,
        type: "text",
      }),
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
        displayName: t("columns.actions"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as any,
    }),
  ];
}

export const icons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};
