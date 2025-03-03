"use client";

import { EventDetailSheet } from "@/components/blocks/asset-events-table/detail-sheet";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { createColumnHelper } from "@tanstack/react-table";
import { Lock, PauseCircle, PlayCircle, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetEventsList>>[number]>();

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("components.asset-events-table");

  return [
    columnHelper.accessor("timestamp", {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column}>
            {t("timestamp")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ getValue }) => (
        <DataTableColumnCell>
          <span className="first-letter:uppercase">{getValue()}</span>
        </DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset", {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column}>
            {t("asset")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ getValue }) => {
        const asset = getValue();

        return (
          <DataTableColumnCell>
            <EvmAddress address={asset as Address}>
              <EvmAddressBalances address={asset as Address} />
            </EvmAddress>
          </DataTableColumnCell>
        );
      },
      enableColumnFilter: true,
    }),
    columnHelper.accessor("event", {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column}>
            {t("event")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ getValue }) => (
        <DataTableColumnCell>{getValue()}</DataTableColumnCell>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("sender", {
      header: ({ column }) => {
        return (
          <DataTableColumnHeader column={column}>
            {t("sender")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ getValue }) => {
        const senderId = getValue();

        return (
          <DataTableColumnCell>
            <EvmAddress address={senderId as Address}>
              <EvmAddressBalances address={senderId as Address} />
            </EvmAddress>
          </DataTableColumnCell>
        );
      },
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "",
      cell: ({ row }) => (
        <DataTableColumnCell>
          <EventDetailSheet
            event={row.original.event}
            sender={row.original.sender}
            asset={row.original.asset}
            timestamp={row.original.timestamp}
            details={row.original.details}
            transactionHash={row.original.transactionHash}
          />
        </DataTableColumnCell>
      ),
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
