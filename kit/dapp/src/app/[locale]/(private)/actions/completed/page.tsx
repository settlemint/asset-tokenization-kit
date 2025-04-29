import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "actions.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("actions"),
    },
    description: t("actions"),
  };
}

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "actions",
  });

  const tabItems: TabItemProps[] = [
    {
      name: t("tabs.pending"),
      href: `/actions/pending`,
    },
    {
      name: t("tabs.upcoming"),
      href: `/actions/upcoming`,
    },
    {
      name: t("tabs.completed"),
      href: `/actions/completed`,
    },
  ];

  return (
    <>
      <div>Something</div>
    </>
  );
}
