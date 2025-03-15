"use client";

import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
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
import { BlockForm } from "./actions/block-form/form";
import { FreezeForm } from "./actions/freeze-form/form";

const columnHelper =
	createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export function columns() {
	// https://next-intl.dev/docs/environments/server-client-components#shared-components
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const t = useTranslations("private.assets.details.holders");

	return [
		columnHelper.accessor("account.id", {
			header: t("fields.wallet-header"),
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
			header: t("fields.balance-header"),
			cell: ({ getValue, row }) =>
				formatNumber(getValue(), { token: row.original.asset.symbol }),
			enableColumnFilter: false,
			meta: {
				variant: "numeric",
			},
		}),
		columnHelper.accessor((row) => formatHolderType(row, t), {
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
		columnHelper.accessor((row) => formatAssetStatus(row, t), {
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
		columnHelper.display({
			id: "actions",
			header: t("actions-header"),
			cell: ({ row }) => {
				return (
					<DataTableRowActions
						actions={[
							{
								id: "block-form",
								label: row.original.blocked
									? t("forms.block.unblock-trigger-label")
									: t("forms.block.block-trigger-label"),
								component: ({ open, onOpenChange }) => (
									<BlockForm
										address={row.original.asset.id}
										account={row.original.account.id}
										isBlocked={row.original.blocked}
										open={open}
										onOpenChange={onOpenChange}
									/>
								),
							},
							{
								id: "freeze-form",
								label: t("forms.freeze.trigger-label"),
								component: ({ open, onOpenChange }) => (
									<FreezeForm
										address={row.original.asset.id}
										userAddress={row.original.account.id}
										balance={row.original.value}
										frozen={row.original.frozen}
										symbol={row.original.asset.symbol}
										open={open}
										onOpenChange={onOpenChange}
									/>
								),
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
