import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { TokenizedDepositPageHeader } from "./_components/page-header";

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
  const tokenizedDeposit = await getTokenizedDepositDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.tokenized-deposits.details",
  });

  return {
    title: tokenizedDeposit?.name,
    description: t("tokenized-deposit-details-description"),
  };
}

const tabs = async (
  address: Address,
  locale: Locale
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.tokenized-deposits.tabs",
  });

  const [tokenizedDeposit, balances, events] = await Promise.all([
    getTokenizedDepositDetail({ address }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t("details"),
      href: `/assets/tokenized-deposits/${address}`,
    },
    {
      name: t("holders"),
      href: `/assets/tokenized-deposits/${address}/holders`,
      badge: tokenizedDeposit.totalHolders,
    },
    {
      name: t("events"),
      href: `/assets/tokenized-deposits/${address}/events`,
      badge: events.length,
    },
    {
      name: t("permissions"),
      href: `/assets/tokenized-deposits/${address}/permissions`,
    },
    {
      name: t("underlying-assets"),
      href: `/assets/tokenized-deposits/${address}/underlying-assets`,
      badge: balances.length,
    },
  ];
};

export default async function TokenizedDepositDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <TokenizedDepositPageHeader address={address} />
      <TabNavigation items={tabItems} />
      {children}
    </>
  );
}
