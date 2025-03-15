import { CreateBondForm } from "@/app/[locale]/(private)/assets/xbonds/_components/create-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function BondsRelated() {
	const t = await getTranslations("private.assets.table.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("bonds.issue-new.title")}
				description={t("bonds.issue-new.description")}
			>
				<CreateBondForm asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("bonds.mechanics.title")}
				description={t("bonds.mechanics.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/bond#contract-features-and-capabilities">
					<Button variant="secondary">{t("bonds.mechanics.button")}</Button>
				</Link>
			</RelatedGridItem>
			<RelatedGridItem
				title={t("bonds.usecases.title")}
				description={t("bonds.usecases.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/bond#why-digital-fund-tokens">
					<Button variant="secondary">{t("bonds.usecases.button")}</Button>
				</Link>
			</RelatedGridItem>
		</RelatedGrid>
	);
}
