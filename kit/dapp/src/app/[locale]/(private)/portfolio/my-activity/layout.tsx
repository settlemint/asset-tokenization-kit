import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

const tabs = [
  {
    name: "Recent transactions",
    href: "/portfolio/activity",
  },
  {
    name: "All events",
    href: "/portfolio/activity/events",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
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

  return (
    <div>
      <PageHeader
        title={t("page-title")}
        subtitle={t("page-description")}
        section={t("portfolio-management")}
      />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
