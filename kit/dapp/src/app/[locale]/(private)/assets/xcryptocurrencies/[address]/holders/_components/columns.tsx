"use client";

import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { formatDate } from "@/lib/utils/date";
import { formatAssetStatus } from "@/lib/utils/format-asset-status";
import { formatHolderType } from "@/lib/utils/format-holder-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { getAddress } from "viem";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.asset-holders-tab");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tHolderType = useTranslations("holder-type");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tAssetStatus = useTranslations("asset-status");

  return [
    columnHelper.accessor("account.id", {
      header: t("wallet-header"),
      cell: ({ getValue }) => {
        const wallet = getAddress(getValue());
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.accessor((row) => formatHolderType(row, tHolderType), {
      id: t("holder-type-header"),
      header: t("holder-type-header"),
    }),
    columnHelper.accessor("frozen", {
      header: t("frozen-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.accessor((row) => formatAssetStatus(row, tAssetStatus), {
      id: t("status-header"),
      header: t("status-header"),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor("lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance" })
          : "-";
      },
      enableColumnFilter: false,
    }),
  ];
}
