"use client";

import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { BlockedUser } from "@/lib/queries/asset/asset-users-schema";
import { formatDate } from "@/lib/utils/date";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";
import { UnblockForm } from "../../_components/unblock-form/form";

const columnHelper = createColumnHelper<BlockedUser>();

export function columns({
  address,
  assettype,
}: {
  address: Address;
  assettype: AssetType;
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.assets.fields");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("user.id", {
      header: t("name"),
      cell: ({ getValue }) => {
        const wallet = getValue();
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor("blockedAt", {
      header: t("blocked-since-header"),
      cell: ({ getValue }) =>
        getValue() ? formatDate(getValue(), { type: "distance", locale }) : "-",
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          {t("actions-header")}
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            actions={[
              {
                id: "unblock-user",
                label: "Unblock User",
                component: ({ open, onOpenChange }) => (
                  <UnblockForm
                    userAddress={row.original.user.id}
                    address={address}
                    assettype={assettype}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
              },
            ]}
          />
        );
      },
      meta: {
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as ColumnMeta<BlockedUser, unknown>,
    }),
  ];
}
