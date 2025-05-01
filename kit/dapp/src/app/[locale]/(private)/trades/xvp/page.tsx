import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CreateXvPForm } from "./_components/create-xvp-form/form";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "trade-management.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("xvp"),
    },
    description: t("xvp"),
  };
}

export default async function XvpPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "trade-management.page",
  });

  return (
    <>
      <PageHeader title={t("xvp")} button={<CreateXvPForm asButton />} />
    </>
  );
}
