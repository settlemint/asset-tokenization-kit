import { CreateFundForm } from "@/app/[locale]/(private)/assets/xfunds/_components/create-form/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function FundsRelated() {
	const t = await getTranslations("private.assets.table.related");

	return (
		<RelatedGrid title={t("title")}>
			<RelatedGridItem
				title={t("funds.issue-new.title")}
				description={t("funds.issue-new.description")}
			>
				<CreateFundForm asButton />
			</RelatedGridItem>
			<RelatedGridItem
				title={t("funds.mechanics.title")}
				description={t("funds.mechanics.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/fund#contract-features-and-capabilities">
					<Button variant="secondary">{t("funds.mechanics.button")}</Button>
				</Link>
			</RelatedGridItem>
			<RelatedGridItem
				title={t("funds.usecases.title")}
				description={t("funds.usecases.description")}
			>
				<Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/fund#why-digital-fund-tokens">
					<Button variant="secondary">{t("funds.usecases.button")}</Button>
				</Link>
			</RelatedGridItem>
		</RelatedGrid>
	);
}
