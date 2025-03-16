import { BurnForm } from "@/app/[locale]/(private)/assets/xstablecoins/[address]/_components/burn-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/xstablecoins/[address]/_components/mint-form/form";
import { UpdateCollateralForm } from "@/app/[locale]/(private)/assets/xstablecoins/[address]/_components/update-collateral-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface StablecoinsRelatedProps {
	address: Address;
	totalSupply: number;
	freeCollateral: number;
	symbol: string;
}

export async function StablecoinsRelated({
	address,
	totalSupply,
	freeCollateral,
	symbol,
}: StablecoinsRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("stablecoins.update-collateral.title")}
				description={t("stablecoins.update-collateral.description")}
			>
				<UpdateCollateralForm address={address} asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("stablecoins.increase-supply.title")}
				description={t("stablecoins.increase-supply.description")}
			>
				<MintForm
					address={address}
					freeCollateral={freeCollateral}
					symbol={symbol}
					asButton
				/>
			</RelatedGridItem>
			<RelatedGridItem
				title={t("stablecoins.decrease-supply.title")}
				description={t("stablecoins.decrease-supply.description")}
			>
				<BurnForm address={address} balance={totalSupply} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
