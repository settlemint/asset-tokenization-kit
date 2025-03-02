import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
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

const tabs = async (
  address: string,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.cryptocurrencies.tabs",
  });

  return [
    {
      name: t("details"),
      href: `/admin/cryptocurrencies/${address}`,
    },
    {
      name: t("holders"),
      href: `/admin/cryptocurrencies/${address}/holders`,
    },
    {
      name: t("events"),
      href: `/admin/cryptocurrencies/${address}/events`,
    },
    {
      name: t("permissions"),
      href: `/admin/cryptocurrencies/${address}/permissions`,
    },
  ];
};

export default async function CryptoCurrenciesDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <CryptoCurrencyPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
