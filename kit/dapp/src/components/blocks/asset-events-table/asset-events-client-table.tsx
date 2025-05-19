"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import type { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { Ellipsis } from "lucide-react";
import { useTranslations } from "next-intl";
import { Columns, icons } from "./asset-events-columns";

export interface AssetEventsClientProps {
  events: Awaited<ReturnType<typeof getAssetEventsList>>;
  disableToolbarAndPagination?: boolean;
  initialColumnFilters?: { id: string; value: string[] }[];
}

/**
 * Client-side component to display asset events with name-searchable filtering
 * Names are loaded asynchronously through the EvmAddress component
 */
export function AssetEventsClientTable({
  events,
  disableToolbarAndPagination = false,
  initialColumnFilters,
}: AssetEventsClientProps) {
  const t = useTranslations("components.asset-events-table");

  return (
    <DataTable
      columns={Columns}
      data={events}
      icons={icons}
      name={t("events")}
      toolbar={{
        enableToolbar: !disableToolbarAndPagination,
      }}
      pagination={{ enablePagination: !disableToolbarAndPagination }}
      initialColumnFilters={initialColumnFilters}
      customEmptyState={{
        icon: Ellipsis,
        title: t("empty-state.title"),
        description: t("empty-state.description"),
      }}
    />
  );
}
