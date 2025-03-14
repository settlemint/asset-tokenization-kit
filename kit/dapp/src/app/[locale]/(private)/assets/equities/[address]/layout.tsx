import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
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

const tabs = async (
  address: Address,
  locale: Locale
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.equities.tabs",
  });

  const [equity, balances, events] = await Promise.all([
    getEquityDetail({ address }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t("details"),
      href: `/assets/equities/${address}`,
    },
    {
      name: t("holders"),
      href: `/assets/equities/${address}/holders`,
      badge: equity.totalHolders,
    },
    {
      name: t("events"),
      href: `/assets/equities/${address}/events`,
      badge: events.length,
    },
    {
      name: t("permissions"),
      href: `/assets/equities/${address}/permissions`,
    },
    {
      name: t("underlying-assets"),
      href: `/assets/equities/${address}/underlying-assets`,
      badge: balances.length,
    },
  ];
};

export default async function EquitiesDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <EquityPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
