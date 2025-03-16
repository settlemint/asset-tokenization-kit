import { BurnForm } from "@/app/[locale]/(private)/assets/xbonds/[address]/_components/burn-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/xbonds/[address]/_components/mint-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondsRelatedProps {
	address: Address;
	totalSupply: number;
}

export async function BondsRelated({
	address,
	totalSupply,
}: BondsRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("bonds.increase-supply.title")}
				description={t("bonds.increase-supply.description")}
			>
				<MintForm address={address} asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("bonds.decrease-supply.title")}
				description={t("bonds.decrease-supply.description")}
			>
				<BurnForm address={address} balance={totalSupply} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
