import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { RelatedGrid } from "@/components/blocks/related-grid/related-grid";
import { RelatedGridItem } from "@/components/blocks/related-grid/related-grid-item";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { BurnForm } from "../_components/burn-form/form";
import { MintForm } from "../_components/mint-form/form";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const equity = await getEquityDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.equities.details",
  });

  return {
    title: t("details-page-title", {
      name: equity?.name,
    }),
    description: t("details-page-description", {
      name: equity?.name,
    }),
  };
}

export default async function EquityDetailPage({ params }: PageProps) {
  const { address, locale } = await params;
  const equity = await getEquityDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.equities",
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
          <BurnForm address={address} balance={equity.totalSupply} asButton />
        </RelatedGridItem>
      </RelatedGrid>
    </>
  );
}
