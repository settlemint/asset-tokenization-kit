import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { BondPageHeader } from "./_components/page-header";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
  }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, locale } = await params;
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.bonds.details",
  });

  return {
    title: bond?.name,
    description: t("bond-details-description"),
  };
}

export default async function BondsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address } = await params;

  return (
    <>
      <BondPageHeader address={address} />
      {children}
    </>
  );
}
