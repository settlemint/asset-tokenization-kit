import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
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

export default async function ActivityLayout({ children }: PropsWithChildren) {
  const t = await getTranslations("admin.activity");

  return (
    <div>
      <PageHeader title={t("page-title")} subtitle={t("page-description")} />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
