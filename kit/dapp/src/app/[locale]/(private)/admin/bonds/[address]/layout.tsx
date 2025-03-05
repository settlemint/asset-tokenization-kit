import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { BondPageHeader } from "./_components/page-header";

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

const tabs = async (
  address: Address,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.tabs",
  });

  const [bond, balances, events] = await Promise.all([
    getBondDetail({ address }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t("details"),
      href: `/admin/bonds/${address}`,
    },
    {
      name: t("holders"),
      href: `/admin/bonds/${address}/holders`,
      badge: bond.totalHolders,
    },
    {
      name: t("events"),
      href: `/admin/bonds/${address}/events`,
      badge: events.length,
    },
    {
      name: t("permissions"),
      href: `/admin/bonds/${address}/permissions`,
    },
    {
      name: t("underlying-assets"),
      href: `/admin/bonds/${address}/underlying-assets`,
      badge: balances.length,
    },
  ];
};

export default async function BondsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <BondPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
