"use client";

import { ColumnAssetStatus } from "@/components/blocks/asset-info/column-asset-status";
import { ColumnHolderType } from "@/components/blocks/asset-info/column-holder-type";
import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { getAddress } from "viem";
import { BlockForm } from "../../_components/block-form/form";
import { hasBlocklist, hasFreeze } from "../../_components/features-enabled";
import { MintForm } from "../../_components/mint-form/form";
import { FreezeForm } from "./actions/freeze-form/form";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export function columns({
  maxMint,
  decimals,
  price,
}: {
  maxMint?: number;
  decimals: number;
  price: Price;
}) {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.assets.details");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("account.id", {
      header: t("holders.fields.wallet-header"),
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
      header: t("holders.fields.balance-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.display({
      id: "price",
      header: t("holders.price-header"),
      cell: ({ row }) => {
        return formatNumber(row.original.value * price.amount, {
          currency: price.currency,
          locale: locale,
        });
      },
      meta: {
        enableCsvExport: false,
        variant: "numeric",
      },
    }),
    columnHelper.accessor("asset", {
      id: t("holders.holder-type-header"),
      header: t("holders.holder-type-header"),
      cell: ({ row }) => {
        return <ColumnHolderType assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor("frozen", {
      header: t("holders.frozen-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
      id: t("holders.status-header"),
      header: t("holders.status-header"),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor("lastActivity", {
      header: t("holders.last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance", locale: locale })
          : "-";
      },
      enableColumnFilter: false,
    }),

    columnHelper.display({
      id: "actions",
      header: t("holders.actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            actions={[
              {
                id: "block-form",
                label: t("forms.form.trigger-label.block"),
                component: ({ open, onOpenChange }) => (
                  <BlockForm
                    address={row.original.asset.id}
                    assettype={row.original.asset.type}
                    userAddress={row.original.account.id}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
                disabled: row.original.asset.paused,
                hidden: !hasBlocklist(row.original.asset.type),
              },
              {
                id: "freeze-form",
                label: t("forms.form.trigger-label.freeze"),
                component: ({ open, onOpenChange }) => (
                  <FreezeForm
                    address={row.original.asset.id}
                    userAddress={row.original.account.id}
                    balance={row.original.value}
                    symbol={row.original.asset.symbol}
                    assettype={row.original.asset.type}
                    decimals={row.original.asset.decimals}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
                disabled: row.original.asset.paused,
                hidden: !hasFreeze(row.original.asset.type),
              },
              {
                id: "mint-form",
                label: t("forms.form.trigger-label.mint"),
                component: ({ open, onOpenChange }) => (
                  <MintForm
                    address={row.original.asset.id}
                    recipient={row.original.account.id}
                    assettype={row.original.asset.type}
                    open={open}
                    onOpenChange={onOpenChange}
                    max={maxMint}
                    decimals={decimals}
                    symbol={row.original.asset.symbol}
                  />
                ),
                disabled: row.original.asset.paused,
              },
            ]}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
