"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { XvpDetailSheet } from "@/components/blocks/xvp-status/detail-sheet";
import { XvpStatusPill } from "@/components/blocks/xvp-status/status-pill";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-list";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { isBefore } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlement>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("id", {
      header: t("columns.id"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.display({
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        return <XvpStatusPill xvp={row.original} />;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("columns.created-at"),
      cell: ({ getValue }) =>
        formatDate(getValue().toString(), { locale, type: "relative" }),
    }),
    columnHelper.accessor("cutoffDate", {
      header: t("columns.expires-at"),
      cell: ({ getValue }) => {
        const expiresAt = getValue();
        const isExpired = isBefore(
          Number(expiresAt) * 1000,
          new Date().getTime()
        );
        return (
          <>
            {isExpired
              ? ` ${t("expired")} ${formatDate(expiresAt.toString(), {
                  locale,
                  type: "relative",
                })}`
              : formatDate(expiresAt.toString(), {
                  locale,
                  type: "relative",
                })}
          </>
        );
      },
    }),
    columnHelper.display({
      id: "details",
      header: t("details"),
      cell: ({ row }) => <XvpDetailSheet xvp={row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: t("columns.actions"),
      cell: ({ row }) => {
        return <DataTableRowActions actions={[]} />;
      },
    }),
  ];
}
