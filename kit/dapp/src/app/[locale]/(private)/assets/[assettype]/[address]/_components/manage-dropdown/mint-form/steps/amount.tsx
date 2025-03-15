import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput as BondMintInput } from "@/lib/mutations/bond/mint/mint-schema";
import type { MintInput as CryptocurrencyMintInput } from "@/lib/mutations/cryptocurrency/mint/mint-schema";
import type { MintInput as EquityMintInput } from "@/lib/mutations/equity/mint/mint-schema";
import type { MintInput as FundMintInput } from "@/lib/mutations/fund/mint/mint-schema";
import type { MintInput as StablecoinMintInput } from "@/lib/mutations/stablecoin/mint/mint-schema";
import type { MintInput as TokenizedDepositMintInput } from "@/lib/mutations/tokenized-deposit/mint/mint-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
	const { control } = useFormContext<
		| BondMintInput
		| EquityMintInput
		| FundMintInput
		| StablecoinMintInput
		| TokenizedDepositMintInput
		| CryptocurrencyMintInput
		| StablecoinMintInput
	>();
	const t = useTranslations("admin.bonds.mint-form.amount");

	return (
		<FormStep title={t("title")} description={t("description")}>
			<div className="grid grid-cols-1 gap-6">
				<FormInput
					control={control}
					name="amount"
					label={t("amount-label")}
					type="number"
					min={1}
					required
				/>
			</div>
		</FormStep>
	);
}

Amount.validatedFields = ["amount"] as const;
