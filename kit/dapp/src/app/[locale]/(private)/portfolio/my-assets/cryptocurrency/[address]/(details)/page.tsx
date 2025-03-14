import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.cryptocurrencies.details",
  });

  return {
    title: t("details-page-title", {
      name: cryptocurrency?.name,
    }),
    description: t("details-page-description", {
      name: cryptocurrency?.name,
    }),
  };
}

export default async function CryptoCurrencyDetailPage({ params }: PageProps) {
  const { address, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.cryptocurrencies",
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
    </>
  );
}
