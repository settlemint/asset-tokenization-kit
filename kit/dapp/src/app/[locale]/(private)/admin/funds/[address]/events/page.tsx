import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.funds.events",
  });

  return {
    title: t("events-page-title", {
      name: fund?.name,
    }),
    description: t("events-page-description", {
      name: fund?.name,
    }),
  };
}

export default async function FundEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
