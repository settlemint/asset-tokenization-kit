"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import {
  CalendarClock,
  CreditCard,
  Lock,
  PauseCircle,
  PlayCircle,
  Unlock,
  User2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

// Create a column helper for the event type
const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetEventsList>>[number]>();

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};

export function Columns() {
  const t = useTranslations("components.asset-events-table");

  return [
    columnHelper.accessor("blockTimestamp", {
      header: t("timestamp"),
      cell: ({ getValue }) => (
        <span className="first-letter:uppercase">{formatDate(getValue())}</span>
      ),
      enableColumnFilter: false,
    }),

    // Asset address column with name filtering
    columnHelper.accessor("emitter.id", {
      header: t("asset"),
      cell: ({ getValue }) => {
        const asset = getValue();

        return (
          <EvmAddress address={asset as Address}>
            <EvmAddressBalances address={asset as Address} />
          </EvmAddress>
        );
      },
      enableColumnFilter: true,
      filterFn: addressNameFilter,
      meta: defineMeta((row) => row.emitter.id, {
        displayName: t("asset"),
        icon: CreditCard,
        type: "text",
      }),
    }),

    columnHelper.accessor("eventName", {
      header: t("event"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.eventName, {
        displayName: t("event"),
        icon: CalendarClock,
        type: "text",
      }),
    }),

    // Sender address column with name filtering
    columnHelper.accessor("sender.id", {
      header: t("sender"),
      cell: ({ getValue }) => {
        const senderId = getValue();

        return (
          <EvmAddress address={senderId as Address}>
            <EvmAddressBalances address={senderId as Address} />
          </EvmAddress>
        );
      },
      enableColumnFilter: true,
      filterFn: addressNameFilter,
      meta: defineMeta((row) => row.sender.id, {
        displayName: t("sender"),
        icon: User2Icon,
        type: "text",
      }),
    }),

    // columnHelper.display({
    //   id: "actions",
    //   header: () => "",
    //   cell: ({ row }) => (
    //     <EventDetailSheet
    //       event={row.original.event}
    //       sender={row.original.sender}
    //       asset={row.original.asset}
    //       assetType={row.original.assetType}
    //       timestamp={row.original.timestamp}
    //       details={row.original.details}
    //       transactionHash={row.original.transactionHash}
    //     />
    //   ),
    //   meta: {
    //     displayName: "Details",
    //     icon: MoreHorizontal,
    //     type: "text",
    //     enableCsvExport: false,
    //   } as ColumnMeta<AssetEvent, unknown>,
    // }),
  ];
}
