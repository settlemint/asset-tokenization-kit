import { BurnForm } from "@/app/[locale]/(private)/assets/xfunds/[address]/_components/burn-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/xfunds/[address]/_components/mint-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface FundsRelatedProps {
	address: Address;
	totalSupply: number;
}

export async function FundsRelated({
	address,
	totalSupply,
}: FundsRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("funds.increase-supply.title")}
				description={t("funds.increase-supply.description")}
			>
				<MintForm address={address} asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("funds.decrease-supply.title")}
				description={t("funds.decrease-supply.description")}
			>
				<BurnForm address={address} balance={totalSupply} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
