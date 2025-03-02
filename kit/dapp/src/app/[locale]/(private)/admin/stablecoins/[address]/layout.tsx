import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
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

const tabs = async (
  address: string,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.tabs",
  });

  return [
    {
      name: t("details"),
      href: `/admin/stablecoins/${address}`,
    },
    {
      name: t("holders"),
      href: `/admin/stablecoins/${address}/holders`,
    },
    {
      name: t("events"),
      href: `/admin/stablecoins/${address}/events`,
    },
    {
      name: t("permissions"),
      href: `/admin/stablecoins/${address}/permissions`,
    },
  ];
};

export default async function FundsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <StableCoinPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
