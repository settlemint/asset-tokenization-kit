import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { FundPageHeader } from "./_components/page-header";

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
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.details",
  });

  return {
    title: fund?.name,
    description: t("fund-details-description"),
  };
}

const tabs = async (
  address: Address,
  locale: Locale
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.tabs",
  });

  const [fund, balances, events] = await Promise.all([
    getFundDetail({ address }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t("details"),
      href: `/assets/funds/${address}`,
    },
    {
      name: t("holders"),
      href: `/assets/funds/${address}/holders`,
      badge: fund.totalHolders,
    },
    {
      name: t("events"),
      href: `/assets/funds/${address}/events`,
      badge: events.length,
    },
    {
      name: t("permissions"),
      href: `/assets/funds/${address}/permissions`,
    },
    {
      name: t("underlying-assets"),
      href: `/assets/funds/${address}/underlying-assets`,
      badge: balances.length,
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
      <FundPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
