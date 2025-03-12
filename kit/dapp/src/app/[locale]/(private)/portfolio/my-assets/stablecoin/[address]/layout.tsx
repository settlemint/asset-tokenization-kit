import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { StableCoinPageHeader } from "./_components/page-header";

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
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.details",
  });

  return {
    title: stableCoin?.name,
    description: t("stablecoin-details-description"),
  };
}


export default async function StablecoinDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;

  return (
    <>
      <StableCoinPageHeader address={address} />
      {children}
    </>
  );
}
