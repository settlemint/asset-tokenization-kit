"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/date";
import { User2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, type ComponentType } from "react";

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  user: User2,
};

export function columns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("portfolio.my-contacts");

  return [
    {
      id: "name",
      accessorKey: "name",
      header: () => t("table.name-header"),
      cell: ({ row }: any) => (
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
      header: () => t("table.wallet-header"),
      cell: ({ row }: any) => (
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
      header: () => t("table.created-at-header"),
      cell: ({ row }: any) => {
        const createdAt = row.original.created_at;
        return createdAt
          ? formatDate(new Date(createdAt), { type: "distance" })
          : "-";
      },
      enableColumnFilter: false,
    },
  ];
}
