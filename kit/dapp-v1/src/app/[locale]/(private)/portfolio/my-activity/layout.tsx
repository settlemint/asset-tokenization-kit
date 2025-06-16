import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

const tabs = async (): Promise<TabItemProps[]> => {
  const t = await getTranslations("portfolio.activity.tabs");
  return [
    {
      name: t("recent-transactions"),
      href: "/portfolio/my-activity",
    },
    {
      name: t("all-events"),
      href: "/portfolio/my-activity/events",
    },
  ];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.activity",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function ActivityLayout({ children }: PropsWithChildren) {
  const t = await getTranslations("portfolio.activity");
  const tabItems = await tabs();

  return (
    <div>
      <PageHeader
        title={t("page-title")}
        subtitle={t("page-description")}
        section={t("portfolio-management")}
      />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </div>
  );
}
