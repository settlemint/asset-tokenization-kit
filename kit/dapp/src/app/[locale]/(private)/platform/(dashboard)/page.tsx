import { PageHeader } from "@/components/layout/page-header";
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
    namespace: "admin.dashboard.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("description"),
  };
}

export default async function PlatformDashboard({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.dashboard.page",
  });

  return (
    <>
      <PageHeader title={t("title")} section={t("platform-management")} />
    </>
  );
}
