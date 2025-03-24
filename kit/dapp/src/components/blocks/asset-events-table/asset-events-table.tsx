import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Columns, icons } from "./asset-events-columns";

interface AssetEventsTableProps {
  asset?: Address;
  sender?: Address;
  disableToolbarAndPagination?: boolean;
  limit?: number;
  initialColumnFilters?: { id: "sender"; value: string[] }[];
}

export async function AssetEventsTable({
  asset,
  sender,
  disableToolbarAndPagination = false,
  limit,
  initialColumnFilters,
}: AssetEventsTableProps) {
  const events = await getAssetEventsList({ asset, sender, limit });
  const t = await getTranslations("components.asset-events-table");

  return (
    <DataTable
      columns={Columns}
      data={events}
      icons={icons}
      name={t("events")}
      toolbar={{ enableToolbar: !disableToolbarAndPagination }}
      pagination={{ enablePagination: !disableToolbarAndPagination }}
      initialColumnFilters={initialColumnFilters}
    />
  );
}
