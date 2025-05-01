import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CreateDvpSwapForm } from "./_components/create-dvp-swap-form/form";

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
      default: t("dvp-swap"),
    },
    description: t("dvp-swap"),
  };
}

export default async function DvpSwapPage({
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
      <PageHeader
        title={t("dvp-swap")}
        button={<CreateDvpSwapForm asButton />}
      />
    </>
  );
}
