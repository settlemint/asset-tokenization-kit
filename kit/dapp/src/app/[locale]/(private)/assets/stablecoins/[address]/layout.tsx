import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
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
  address: Address,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.tabs",
  });

  const [stableCoin, balances, events] = await Promise.all([
    getStableCoinDetail({ address }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t("details"),
      href: `/assets/stablecoins/${address}`,
    },
    {
      name: t("holders"),
      href: `/assets/stablecoins/${address}/holders`,
      badge: stableCoin.totalHolders,
    },
    {
      name: t("events"),
      href: `/assets/stablecoins/${address}/events`,
      badge: events.length,
    },
    {
      name: t("permissions"),
      href: `/assets/stablecoins/${address}/permissions`,
    },
    {
      name: t("underlying-assets"),
      href: `/assets/stablecoins/${address}/underlying-assets`,
      badge: balances.length,
    },
  ];
};

export default async function StablecoinDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <StableCoinPageHeader address={address} />
      <TabNavigation items={tabItems} />
      {children}
    </>
  );
}
