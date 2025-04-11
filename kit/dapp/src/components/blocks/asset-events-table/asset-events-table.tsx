import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getLocale } from "next-intl/server";
import type { Address } from "viem";
import { AssetEventsClientTable } from "./asset-events-client-table";

interface AssetEventsTableProps {
  disableToolbarAndPagination?: boolean;
  initialColumnFilters?: { id: string; value: string[] }[];
  asset?: Address;
  sender?: Address;
  limit?: number;
}

/**
 * Server component that fetches data and passes it to the client component
 */
export async function AssetEventsTable({
  disableToolbarAndPagination = false,
  initialColumnFilters,
  asset,
  sender,
  limit,
}: AssetEventsTableProps) {
  const locale = await getLocale();
  const events = await getAssetEventsList({ asset, sender, limit, locale });

  return (
    <AssetEventsClientTable
      events={events}
      disableToolbarAndPagination={disableToolbarAndPagination}
      initialColumnFilters={initialColumnFilters}
    />
  );
}
