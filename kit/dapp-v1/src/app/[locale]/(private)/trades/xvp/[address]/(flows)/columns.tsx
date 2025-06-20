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
    columnHelper.accessor("asset", {
      header: t("columns.asset"),
      cell: ({ getValue, row }) => {
        const asset = getValue();
        return (
          <EvmAddress address={asset.id} symbol={asset.symbol} showAssetType />
        );
      },
    }),
    columnHelper.accessor("from", {
      header: t("columns.from"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue().id} copyToClipboard />
      ),
    }),
    columnHelper.accessor("to", {
      header: t("columns.to"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue().id} copyToClipboard />
      ),
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
        return formatNumber(getValue().amount * Number(row.original.amount), {
          locale,
          currency: row.original.assetPrice.currency,
        });
      },
    }),
  ];
}
