import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.stablecoins.events",
  });

  return {
    title: t("events-page-title", {
      name: stableCoin?.name,
    }),
    description: t("events-page-description", {
      name: stableCoin?.name,
    }),
  };
}

export default async function StablecoinEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
