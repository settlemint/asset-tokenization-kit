"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { Skeleton } from "@/components/ui/skeleton";
import { defineMeta, filterFn } from "@/lib/filters";
import type { Contact } from "@/lib/queries/contact/contact-schema";
import { createColumnHelper } from "@tanstack/react-table";
import { User2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, Suspense } from "react";

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  user: User2,
};

export function Columns() {
  const t = useTranslations("portfolio.my-contacts.table");
  const columnHelper = createColumnHelper<Contact>();

  return [
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ row }) => (
        <>
          <Suspense fallback={<Skeleton className="size-8 rounded-lg" />}>
            <AddressAvatar address={row.original.wallet} size="small" />
          </Suspense>
          <span>{row.getValue("name")}</span>
        </>
      ),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.name, {
        displayName: t("name-header"),
        icon: User2,
        type: "text",
      }),
    }),
    columnHelper.accessor("wallet", {
      header: t("wallet-header"),
      cell: ({ row }) => (
        <div className="flex items-center">
          <EvmAddress
            address={row.getValue("wallet")}
            prettyNames={false}
            copyToClipboard={true}
          >
            <EvmAddressBalances address={row.getValue("wallet")} />
          </EvmAddress>
        </div>
      ),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.wallet, {
        displayName: t("wallet-header"),
        icon: Wallet,
        type: "text",
      }),
    }),
  ];
}
