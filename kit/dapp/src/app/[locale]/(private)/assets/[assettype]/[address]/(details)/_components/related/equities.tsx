import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../../../_components/manage-dropdown/burn-form/form";
import { MintForm } from "../../../_components/manage-dropdown/mint-form/form";

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
				<MintForm address={address} assettype="equities" asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("equities.decrease-supply.title")}
				description={t("equities.decrease-supply.description")}
			>
				<BurnForm
					address={address}
					balance={totalSupply}
					assettype="equities"
					asButton
				/>
			</RelatedGridItem>
		</RelatedGrid>
	);
}
