import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { MintInput as BondMintInput } from "@/lib/mutations/bond/mint/mint-schema";
import type { MintInput as CryptocurrencyMintInput } from "@/lib/mutations/cryptocurrency/mint/mint-schema";
import type { MintInput as EquityMintInput } from "@/lib/mutations/equity/mint/mint-schema";
import type { MintInput as FundMintInput } from "@/lib/mutations/fund/mint/mint-schema";
import type { MintInput as StablecoinMintInput } from "@/lib/mutations/stablecoin/mint/mint-schema";
import type { MintInput as TokenizedDepositMintInput } from "@/lib/mutations/tokenized-deposit/mint/mint-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function Recipients() {
	const { control } = useFormContext<
		| BondMintInput
		| CryptocurrencyMintInput
		| EquityMintInput
		| FundMintInput
		| StablecoinMintInput
		| TokenizedDepositMintInput
		| StablecoinMintInput
	>();
	const [isManualEntry, setIsManualEntry] = useState(false);

	const t = useTranslations("admin.bonds.mint-form.recipients");

	return (
		<FormStep title={t("title")} description={t("description")}>
			<div className="grid grid-cols-1 gap-6">
				<div className="space-y-1">
					{isManualEntry ? (
						<FormInput
							control={control}
							name="to"
							label="Wallet Address"
							placeholder="0x0000000000000000000000000000000000000000"
						/>
					) : (
						<FormUsers
							control={control}
							name="to"
							label="Wallet Address"
							placeholder="Search for a user"
						/>
					)}
					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => setIsManualEntry(!isManualEntry)}
							className="text-muted-foreground text-xs transition-colors hover:text-foreground"
						>
							{isManualEntry
								? "Search for a user instead..."
								: "Enter address manually..."}
						</button>
					</div>
				</div>
			</div>
		</FormStep>
	);
}

Recipients.validatedFields = ["to"] as const;
