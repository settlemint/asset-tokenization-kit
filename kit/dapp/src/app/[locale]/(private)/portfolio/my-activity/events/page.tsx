import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.activity",
  });

  return {
    title: {
      ...metadata.title,
      default: t("tabs.all-events"),
    },
    description: t("page-description"),
  };
}

export default async function ActivityPage() {
  const user = await getUser();

  return <AssetEventsTable sender={user.wallet as Address} />;
}
