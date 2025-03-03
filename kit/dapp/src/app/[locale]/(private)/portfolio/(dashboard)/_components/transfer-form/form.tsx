"use client";

import { Basics } from "@/app/[locale]/(private)/admin/stablecoins/_components/create-form/steps/basics";
import { Configuration } from "@/app/[locale]/(private)/admin/stablecoins/_components/create-form/steps/configuration";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import type { TransferFormAssetType } from "./schema";
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
	address,
	name,
	symbol,
	assetType,
	balance,
	decimals,
	onCloseAction,
}: {
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
				<Basics />
				<Configuration />
				<Summary />
			</Form>
		</FormSheet>
	);
}

