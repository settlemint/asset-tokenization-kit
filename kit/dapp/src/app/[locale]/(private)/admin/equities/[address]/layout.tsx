import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { EquityPageHeader } from "./_components/page-header";

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
  address: string,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "admin.equities.tabs",
  });

  return [
    {
      name: t("details"),
      href: `/admin/equities/${address}`,
    },
    {
      name: t("holders"),
      href: `/admin/equities/${address}/holders`,
    },
    {
      name: t("events"),
      href: `/admin/equities/${address}/events`,
    },
    {
      name: t("permissions"),
      href: `/admin/equities/${address}/permissions`,
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
