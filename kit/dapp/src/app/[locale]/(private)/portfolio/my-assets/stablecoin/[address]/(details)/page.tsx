import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { CollateralRatio } from "@/components/blocks/charts/assets/collateral-ratio";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
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
        <CollateralRatio address={address} />
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
    </>
  );
}
