import { UpdateCollateralForm } from "@/app/[locale]/(private)/admin/stablecoins/[address]/_components/update-collateral-form/form";
import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../_components/burn-form/form";
import { MintForm } from "../_components/mint-form/form";
import { Collateral } from "./_components/collateral";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.details",
  });

  return {
    title: t("details-page-title", {
      name: stableCoin?.name,
    }),
    description: t("details-page-description", {
      name: stableCoin?.name,
    }),
  };
}

export default async function StableCoinDetailPage({ params }: PageProps) {
  const { address, locale } = await params;
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins",
  });

  return (
    <>
      <Details address={address} />
      <Collateral address={address} />
      <ChartGrid title={t("charts.asset-statistics-title")}>
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
      <RelatedGrid title={t("related-actions.title")}>
        <RelatedGridItem
          title={t("related-actions.update-collateral.title")}
          description={t("related-actions.update-collateral.description")}
        >
          <UpdateCollateralForm address={address} asButton />
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.increase-supply.title")}
          description={t("related-actions.increase-supply.description")}
        >
          <MintForm
            address={address}
            collateralAvailable={stableCoin.collateral}
            asButton
          />
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.decrease-supply.title")}
          description={t("related-actions.decrease-supply.description")}
        >
          <BurnForm
            address={address}
            balance={stableCoin.totalSupply}
            asButton
          />
        </RelatedGridItem>
      </RelatedGrid>
    </>
  );
}
