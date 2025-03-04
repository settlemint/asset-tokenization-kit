"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { TransferFormAssetType } from "@/lib/mutations/asset/transfer/transfer-schema";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from './steps/summary';

export function formatAssetType(type: string) {
  switch (type) {
    case 'bond':
      return 'Bond';
    case 'stablecoin':
      return 'Stablecoin';
    case 'equity':
      return 'Equity';
    case 'cryptocurrency':
      return 'Cryptocurrency';
    case 'fund':
      return 'Fund';
    default:
      return 'Unknown';
  }
}

export function TransferForm({
	open,
	address,
	name,
	symbol,
	assetType,
	balance,
	decimals,
	onCloseAction,
}: {
	open: boolean;
	address: Address;
	name: string;
	symbol: string;
	assetType: TransferFormAssetType;
	balance: string;
	decimals: number;
	onCloseAction: () => void;
}) {
	const t = useTranslations("portfolio.transfer-form");

	return (
		<FormSheet
			open={open}
			onOpenChange={onCloseAction}
			title={`Transfer ${formatAssetType(assetType)} ${name} (${symbol})`}
			description={`Easily transfer an amount of ${formatAssetType(assetType)} ${name} (${symbol}) by selecting a recipient and specifying the amount.`}
		>
			<Form
				action={createStablecoin}
				resolver={zodResolver(CreateStablecoinSchema)}
				onOpenChange={onCloseAction}
				buttonLabels={{
					label: t("transfer"),
				}}
				defaultValues={{
					collateralLivenessSeconds: 3600 * 24 * 365,
				}}
			>
				<Recipients />
      	<Amount balance={balance} />
      	<Summary address={address} assetType={assetType} decimals={decimals} />
			</Form>
		</FormSheet>
	);
}

