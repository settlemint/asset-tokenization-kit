import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { CryptoCurrencyPageHeader } from "./_components/page-header";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: string;
    address: Address;
  }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, locale } = await params;
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.cryptocurrencies.details",
  });

  return {
    title: cryptocurrency?.name,
    description: t("cryptocurrency-details-description"),
  };
}

export default async function CryptoCurrenciesDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address } = await params;

  return (
    <>
      <CryptoCurrencyPageHeader address={address} />
      {children}
    </>
  );
}
