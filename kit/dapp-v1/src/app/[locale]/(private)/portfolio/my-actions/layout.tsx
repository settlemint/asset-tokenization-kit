import { ActionTabs } from "@/components/blocks/actions-table/action-tabs";
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

  return (
    <>
      <PageHeader title={t("page.actions")} />
      <ActionTabs locale={locale} path="portfolio/my-actions" type="User" />
      {children}
    </>
  );
}
