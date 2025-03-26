import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function EventsPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <TotalSupply address={address} interval="month" size="large" />
      <AssetEventsTable asset={address} />
    </>
  );
}
