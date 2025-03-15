import { AssetRolePill } from "@/components/blocks/asset-role-pill/asset-role-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
	address: Address;
}

export function Summary({ address }: SummaryProps) {
	const { control } = useFormContext<GrantRoleInput>();
	const t = useTranslations("admin.stablecoins.grant-role-form.summary");
	const values = useWatch({
		control,
	});

	return (
		<FormStep title={t("title")} description={t("description")}>
			<FormSummaryDetailCard
				title={t("grant-title")}
				description={t("grant-description")}
				icon={<DollarSign className="size-3 text-primary-foreground" />}
			>
				<FormSummaryDetailItem
					label={t("asset-label")}
					value={<EvmAddress address={address} />}
				/>

				<FormSummaryDetailItem
					label={t("admin-address-label")}
					value={
						values.userAddress ? (
							<EvmAddress address={values.userAddress} />
						) : (
							"-"
						)
					}
				/>

				<FormSummaryDetailItem
					label={t("roles-label")}
					value={<AssetRolePill roles={values.roles} />}
				/>
			</FormSummaryDetailCard>
		</FormStep>
	);
}

Summary.validatedFields = [] as const;
