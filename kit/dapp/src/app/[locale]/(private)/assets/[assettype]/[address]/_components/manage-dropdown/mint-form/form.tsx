"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { mint as BondMint } from "@/lib/mutations/bond/mint/mint-action";
import { MintSchema as BondMintSchema } from "@/lib/mutations/bond/mint/mint-schema";
import { mint as CryptocurrencyMint } from "@/lib/mutations/cryptocurrency/mint/mint-action";
import { MintSchema as CryptocurrencyMintSchema } from "@/lib/mutations/cryptocurrency/mint/mint-schema";
import { mint as EquityMint } from "@/lib/mutations/equity/mint/mint-action";
import { MintSchema as EquityMintSchema } from "@/lib/mutations/equity/mint/mint-schema";
import { mint as FundMint } from "@/lib/mutations/fund/mint/mint-action";
import { MintSchema as FundMintSchema } from "@/lib/mutations/fund/mint/mint-schema";
import { mint as StablecoinMint } from "@/lib/mutations/stablecoin/mint/mint-action";
import { MintSchema as StablecoinMintSchema } from "@/lib/mutations/stablecoin/mint/mint-schema";
import { mint as TokenizedDepositMint } from "@/lib/mutations/tokenized-deposit/mint/mint-action";
import { MintSchema as TokenizedDepositMintSchema } from "@/lib/mutations/tokenized-deposit/mint/mint-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import type { AssetType } from "../../../../types";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface MintFormProps {
	address: Address;
	assettype: AssetType;
	asButton?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function MintForm({
	address,
	assettype,
	asButton = false,
	open,
	onOpenChange,
}: MintFormProps) {
	const t = useTranslations("admin.bonds.mint-form");
	const isExternallyControlled =
		open !== undefined && onOpenChange !== undefined;
	const [internalOpenState, setInternalOpenState] = useState(false);

	return (
		<FormSheet
			open={isExternallyControlled ? open : internalOpenState}
			onOpenChange={
				isExternallyControlled ? onOpenChange : setInternalOpenState
			}
			triggerLabel={isExternallyControlled ? undefined : t("trigger-label")}
			title={t("title")}
			description={t("description")}
			asButton={asButton}
		>
			<Form
				action={
					assettype === "bonds"
						? BondMint
						: assettype === "equities"
							? EquityMint
							: assettype === "funds"
								? FundMint
								: assettype === "tokenizeddeposits"
									? TokenizedDepositMint
									: assettype === "cryptocurrencies"
										? CryptocurrencyMint
										: StablecoinMint
				}
				resolver={
					assettype === "bonds"
						? zodResolver(BondMintSchema)
						: assettype === "equities"
							? zodResolver(EquityMintSchema)
							: assettype === "funds"
								? zodResolver(FundMintSchema)
								: assettype === "tokenizeddeposits"
									? zodResolver(TokenizedDepositMintSchema)
									: assettype === "cryptocurrencies"
										? zodResolver(CryptocurrencyMintSchema)
										: zodResolver(StablecoinMintSchema)
				}
				onOpenChange={
					isExternallyControlled ? onOpenChange : setInternalOpenState
				}
				buttonLabels={{
					label: t("button-label"),
				}}
				defaultValues={{
					address,
				}}
			>
				<Amount />
				<Recipients />
				<Summary address={address} />
			</Form>
		</FormSheet>
	);
}
