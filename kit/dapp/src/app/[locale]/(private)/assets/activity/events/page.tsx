import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
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
    namespace: "admin.activity",
  });

  return {
    title: {
      ...metadata.title,
      default: t("tabs.all-events"),
    },
    description: t("page-description"),
  };
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ sender: string }>;
}) {
  const { sender } = await searchParams;
  return (
    <AssetEventsTable
      initialColumnFilters={sender ? [{ id: "sender", value: [sender] }] : []}
    />
  );
}
