import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { EquityPageHeader } from "./_components/page-header";

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
  const equity = await getEquityDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.equities.details",
  });

  return {
    title: equity?.name,
    description: t("equity-details-description"),
  };
}

export default async function EquitiesDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address } = await params;

  return (
    <>
      <EquityPageHeader address={address} />
      {children}
    </>
  );
}
