import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

const tabs = [
  {
    name: "Recent transactions",
    href: "/admin/activity",
  },
  {
    name: "All events",
    href: "/admin/activity/events",
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
    namespace: "admin.activity",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default async function ActivityLayout({ children }: PropsWithChildren) {
  const t = await getTranslations("admin.activity");

  return (
    <div>
      <PageHeader
        title={t("page-title")}
        subtitle={t("page-description")}
        section={t("asset-management")}
      />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
