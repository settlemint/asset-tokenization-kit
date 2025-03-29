import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function EventsPage({ params }: PageProps) {
  const { address, locale } = await params;
  const assetStats = await getAssetStats({ address });

  return (
    <>
      <TotalSupply data={assetStats} locale={locale} size="large" />
      <AssetEventsTable asset={address} />
    </>
  );
}
