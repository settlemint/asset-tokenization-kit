import { BurnForm } from "@/app/[locale]/(private)/assets/xtokenized-deposits/[address]/_components/burn-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/xtokenized-deposits/[address]/_components/mint-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TokenizedDepositsRelatedProps {
	address: Address;
	totalSupply: number;
}

export async function TokenizedDepositsRelated({
	address,
	totalSupply,
}: TokenizedDepositsRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("tokenizeddeposits.increase-supply.title")}
				description={t("tokenizeddeposits.increase-supply.description")}
			>
				<MintForm address={address} asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("tokenizeddeposits.decrease-supply.title")}
				description={t("tokenizeddeposits.decrease-supply.description")}
			>
				<BurnForm address={address} balance={totalSupply} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
