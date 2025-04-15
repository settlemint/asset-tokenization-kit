import { AssetEventsSkeleton } from "@/components/blocks/asset-events-table/asset-events-skeleton";
import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function EventsPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <Suspense fallback={<AssetEventsSkeleton />}>
        <AssetEventsTable asset={address} />
      </Suspense>
    </>
  );
}
