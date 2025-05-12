import { ActionsTable } from "@/components/blocks/actions-table/actions-table";
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

export default async function ActionsPage() {
  return <ActionsTable state="PENDING" actionType="User" />;
}
