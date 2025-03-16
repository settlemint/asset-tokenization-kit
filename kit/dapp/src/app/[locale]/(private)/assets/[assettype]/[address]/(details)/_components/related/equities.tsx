import { BurnForm } from "@/app/[locale]/(private)/assets/xequities/[address]/_components/burn-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/xequities/[address]/_components/mint-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface EquitiesRelatedProps {
	address: Address;
	totalSupply: number;
}

export async function EquitiesRelated({
	address,
	totalSupply,
}: EquitiesRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("equities.increase-supply.title")}
				description={t("equities.increase-supply.description")}
			>
				<MintForm address={address} asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("equities.decrease-supply.title")}
				description={t("equities.decrease-supply.description")}
			>
				<BurnForm address={address} balance={totalSupply} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
