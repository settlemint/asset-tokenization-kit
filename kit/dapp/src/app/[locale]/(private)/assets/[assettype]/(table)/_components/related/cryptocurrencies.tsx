import { CreateCryptoCurrencyForm } from "@/components/blocks/create-forms/cryptocurrencies/form";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function CryptocurrenciesRelated() {
  const t = await getTranslations("private.assets.table.related");

  return (
    <RelatedGrid title={t("title")}>
      <RelatedGridItem
        title={t("cryptocurrency.issue-new.title")}
        description={t("cryptocurrency.issue-new.description")}
      >
        <CreateCryptoCurrencyForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t("cryptocurrency.mechanics.title")}
        description={t("cryptocurrency.mechanics.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/cryptocurrency#contract-features-and-capabilities">
          <Button variant="secondary">
            {t("cryptocurrency.mechanics.button")}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t("cryptocurrency.usecases.title")}
        description={t("cryptocurrency.usecases.description")}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/cryptocurrency#why-digital-fund-tokens">
          <Button variant="secondary">
            {t("cryptocurrency.usecases.button")}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
