import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { TabItemProps } from "../../../../../components/blocks/tab-navigation/tab-item";

const tabs = async (): Promise<TabItemProps[]> => {
  const t = await getTranslations("admin.activity.tabs");
  return [
    {
      name: t("recent-transactions"),
      href: "/assets/activity",
    },
    {
      name: t("all-events"),
      href: "/assets/activity/events",
    },
  ];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.activity",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function ActivityLayout({ children }: PropsWithChildren) {
  const t = await getTranslations("admin.activity");
  const tabItems = await tabs();
  return (
    <div>
      <PageHeader
        title={t("page-title")}
        subtitle={t("page-description")}
        section={t("asset-management")}
      />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </div>
  );
}
