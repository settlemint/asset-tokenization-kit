"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contact } from "@/lib/queries/contact/contact-fragment";
import { formatDate } from "@/lib/utils/date";
import type { Row } from "@tanstack/react-table";
import { User2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ComponentType, Suspense } from "react";

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  user: User2,
};

export function Columns() {
  const t = useTranslations("portfolio.my-contacts.table");
  const locale = useLocale();

  return [
    {
      id: "name",
      accessorKey: "name",
      header: () => t("name-header"),
      cell: ({ row }: { row: Row<Contact> }) => (
        <>
          <Suspense fallback={<Skeleton className="size-8 rounded-lg" />}>
            <AddressAvatar address={row.original.wallet} size="small" />
          </Suspense>
          <span>{row.original.name}</span>
        </>
      ),
      enableColumnFilter: false,
    },
    {
      id: "wallet",
      accessorKey: "wallet",
      header: () => t("wallet-header"),
      cell: ({ row }: { row: Row<Contact> }) => (
        <div className="flex items-center">
          <EvmAddress
            address={row.original.wallet}
            prettyNames={false}
            copyToClipboard={true}
          >
            <EvmAddressBalances address={row.original.wallet} />
          </EvmAddress>
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: () => t("created-at-header"),
      cell: ({ row }: { row: Row<Contact> }) => {
        const createdAt = row.original.created_at;
        return createdAt
          ? formatDate(new Date(createdAt), {
              type: "distance",
              locale: locale,
            })
          : "-";
      },
      enableColumnFilter: false,
    },
  ];
}
