import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
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
      <Suspense fallback={<DataTableSkeleton />}>
        <AssetEventsTable asset={address} />
      </Suspense>
    </>
  );
}
