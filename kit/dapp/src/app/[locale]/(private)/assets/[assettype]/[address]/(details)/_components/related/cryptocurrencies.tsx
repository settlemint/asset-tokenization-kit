import { MintForm } from "@/app/[locale]/(private)/assets/xcryptocurrencies/[address]/_components/mint-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface CryptocurrenciesRelatedProps {
	address: Address;
}

export async function CryptocurrenciesRelated({
	address,
}: CryptocurrenciesRelatedProps) {
	const t = await getTranslations("private.assets.details.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("cryptocurrencies.increase-supply.title")}
				description={t("cryptocurrencies.increase-supply.description")}
			>
				<MintForm address={address} asButton />
			</RelatedGridItem>
		</RelatedGrid>
	);
}
