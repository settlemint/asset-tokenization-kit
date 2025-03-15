import { CreateEquityForm } from "@/app/[locale]/(private)/assets/xequities/_components/create-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function EquitiesRelated() {
	const t = await getTranslations("private.assets.table.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("equities.issue-new.title")}
				description={t("equities.issue-new.description")}
			>
				<CreateEquityForm asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("equities.mechanics.title")}
				description={t("equities.mechanics.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#contract-features-and-capabilities">
					<Button variant="secondary">{t("equities.mechanics.button")}</Button>
				</Link>
			</RelatedGridItem>
			<RelatedGridItem
				title={t("equities.usecases.title")}
				description={t("equities.usecases.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/equity#why-digital-fund-tokens">
					<Button variant="secondary">{t("equities.usecases.button")}</Button>
				</Link>
			</RelatedGridItem>
		</RelatedGrid>
	);
}
