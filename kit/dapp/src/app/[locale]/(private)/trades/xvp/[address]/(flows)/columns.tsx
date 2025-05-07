"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { XvPSettlementFlow } from "@/lib/queries/xvp/xvp-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlementFlow>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.display({
      id: "participants",
      header: t("columns.participants"),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <EvmAddress address={row.original.from.id} />
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
          <EvmAddress address={row.original.to.id} />
        </div>
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
