"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { XvPSettlementFlow } from "@/lib/queries/xvp/xvp-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlementFlow>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("from", {
      header: t("columns.from"),
      cell: ({ row }) => {
        return <EvmAddress address={row.original.from.id} />;
      },
    }),
    columnHelper.accessor("to", {
      header: t("columns.to"),
      cell: ({ row }) => {
        return <EvmAddress address={row.original.to.id} />;
      },
    }),
    columnHelper.accessor("amount", {
      header: t("columns.amount"),
      cell: ({ getValue, row }) => {
        return formatNumber(getValue(), {
          locale,
          decimals: 2,
          token: row.original.asset.symbol,
        });
      },
    }),
    columnHelper.accessor("assetPrice", {
      header: t("columns.price"),
      cell: ({ row, getValue }) => {
        return formatNumber(getValue().amount, {
          locale,
          currency: row.original.assetPrice.currency,
        });
      },
    }),
  ];
}
