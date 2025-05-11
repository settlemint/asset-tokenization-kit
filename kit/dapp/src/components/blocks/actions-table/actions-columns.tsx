"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { Action } from "@/lib/queries/actions/actions-schema";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper, type ColumnHelper } from "@tanstack/react-table";
import { PlayCircle, Target, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getAddress, isAddress } from "viem";

const columnHelper = createColumnHelper<Action>();

export function Columns({
  state,
}: {
  state: "pending" | "upcoming" | "executed";
}) {
  const t = useTranslations("actions");
  const locale = useLocale();

  return [
    columnHelper.accessor("name", {
      header: t("columns.name"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      meta: defineMeta((row) => row.name, {
        displayName: t("columns.name"),
        icon: PlayCircle,
        type: "text",
      }),
    }),
    columnHelper.accessor("target.id", {
      header: t("columns.subject"),
      cell: ({ getValue }) => {
        const target = getValue();
        if (isAddress(target)) {
          return (
            <EvmAddress address={target} prettyNames={false}>
              <EvmAddressBalances address={target} />
            </EvmAddress>
          );
        }

        return target;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (isAddress(row.original.target.id)) {
          return addressNameFilter(row, columnId, filterValue);
        }
        return filterFn("text")(row, columnId, filterValue);
      },
      meta: defineMeta((row) => row.target.id, {
        displayName: t("columns.subject"),
        icon: Target,
        type: "text",
      }),
    }),
    columnHelper.display({
      header: t("columns.description"),
      cell: ({ row }) => t(`description.${row.original.name}`),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("activeAt", {
      header: t("columns.active-at"),
      cell: ({ row }) =>
        row.original.activeAt
          ? formatDate(row.original.activeAt, {
              locale,
            })
          : null,
    }),
    ...(state === "pending"
      ? PendingColumns(columnHelper)
      : state === "executed"
        ? CompletedColumns(columnHelper)
        : []),
  ];
}

function CompletedColumns(columnHelper: ColumnHelper<Action>) {
  const t = useTranslations("actions");
  const locale = useLocale();
  return [
    columnHelper.accessor("executedAt", {
      header: t("columns.completed-on"),
      cell: ({ getValue }) =>
        formatDate(getValue()!, {
          locale,
        }),
    }),
    columnHelper.accessor("executedBy.id", {
      header: t("columns.executed-by"),
      cell: ({ getValue }) => (
        <EvmAddress address={getAddress(getValue())} prettyNames={false}>
          <EvmAddressBalances address={getAddress(getValue())} />
        </EvmAddress>
      ),
      meta: defineMeta((row) => row.executedBy!.id, {
        displayName: t("columns.executed-by"),
        icon: User,
        type: "text",
      }),
    }),
  ];
}

function PendingColumns(columnHelper: ColumnHelper<Action>) {
  const t = useTranslations("actions");
  return [
    columnHelper.accessor("activeAt", {
      header: t("columns.active-at"),
    }),
    // TODO: Add action buttons
  ];
}
