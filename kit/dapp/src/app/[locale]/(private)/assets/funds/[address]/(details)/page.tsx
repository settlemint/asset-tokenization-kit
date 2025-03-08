import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../_components/burn-form/form";
import { MintForm } from "../_components/mint-form/form";
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
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.details",
  });

  return {
    title: t("details-page-title", {
      name: fund?.name,
    }),
    description: t("details-page-description", {
      name: fund?.name,
    }),
  };
}

export default async function FundDetailPage({ params }: PageProps) {
  const { address, locale } = await params;
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.funds",
  });

  return (
    <>
      <Details address={address} />
      <ChartGrid title={t("charts.asset-statistics-title")}>
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
      <RelatedGrid title={t("related-actions.title")}>
        <RelatedGridItem
          title={t("related-actions.increase-supply.title")}
          description={t("related-actions.increase-supply.description")}
        >
          <MintForm address={address} asButton />
        </RelatedGridItem>
        <RelatedGridItem
          title={t("related-actions.decrease-supply.title")}
          description={t("related-actions.decrease-supply.description")}
        >
          <BurnForm address={address} balance={fund.totalSupply} asButton />
        </RelatedGridItem>
      </RelatedGrid>
    </>
  );
}
