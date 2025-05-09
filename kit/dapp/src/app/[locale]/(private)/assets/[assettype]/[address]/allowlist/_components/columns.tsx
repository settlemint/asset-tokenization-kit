"use client";

import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { AllowedUser } from "@/lib/queries/asset/asset-users-schema";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { CalendarIcon, MoreHorizontal, User2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";
import { DisallowForm } from "../../_components/disallow-form/form";

const columnHelper = createColumnHelper<AllowedUser>();

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
      enableColumnFilter: true,
      filterFn: addressNameFilter,
      cell: ({ getValue }) => {
        const wallet = getValue();
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      meta: defineMeta((row) => row.user.id, {
        displayName: t("name"),
        icon: User2Icon,
        type: "text",
      }),
    }),
    columnHelper.accessor("allowedAt", {
      header: t("allowed-since-header"),
      cell: ({ getValue }) =>
        getValue() ? formatDate(getValue(), { type: "distance", locale }) : "-",
      enableColumnFilter: true,
      filterFn: filterFn("date"),
      meta: defineMeta((row) => row.allowedAt, {
        displayName: t("allowed-since-header"),
        icon: CalendarIcon,
        type: "date",
      }),
    }),
    columnHelper.display({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>
          {t("actions-header")}
        </DataTableColumnHeader>
      ),
      cell: ({ row, table }) => {
        const rows = table.getRowModel().rows.map((row) => row.original);
        return (
          <DataTableRowActions
            actions={[
              {
                id: "disallow-user",
                label: "Disallow User",
                component: ({ open, onOpenChange }) => (
                  <DisallowForm
                    userAddress={row.original.user.id}
                    address={address}
                    assettype={assettype}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
                disabled: rows.length === 1,
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
      } as ColumnMeta<AllowedUser, unknown>,
    }),
  ];
}
