import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "layout.navigation",
  });

  return {
    title: {
      ...metadata.title,
      default: t("actions"),
    },
  };
}

export default async function ActionsLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "actions",
  });
  const tabItems: TabItemProps[] = [
    {
      name: t("tabs.pending"),
      href: `/portfolio/my-actions/pending`,
    },
    {
      name: t("tabs.upcoming"),
      href: `/portfolio/my-actions/upcoming`,
    },
    {
      name: t("tabs.completed"),
      href: `/portfolio/my-actions/completed`,
    },
  ];
  return (
    <>
      <PageHeader title={t("page.my-actions")} />
      <TabNavigation items={tabItems} />
      {children}
    </>
  );
}
