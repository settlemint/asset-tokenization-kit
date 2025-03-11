"use client";

import { EventDetailSheet } from "@/components/blocks/asset-events-table/detail-sheet";
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
      header: t("timestamp"),
      cell: ({ getValue }) => (
        <span className="first-letter:uppercase">{getValue()}</span>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset", {
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
    }),
    columnHelper.accessor("event", {
      header: t("event"),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("sender", {
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
    }),
    columnHelper.display({
      id: "actions",
      header: () => "",
      cell: ({ row }) => (
        <EventDetailSheet
          event={row.original.event}
          sender={row.original.sender}
          asset={row.original.asset}
          timestamp={row.original.timestamp}
          details={row.original.details}
          transactionHash={row.original.transactionHash}
        />
      ),
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
