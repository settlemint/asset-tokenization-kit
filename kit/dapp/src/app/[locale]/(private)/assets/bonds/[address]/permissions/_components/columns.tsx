"use client";

import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { getRoleDisplayName, type Role } from "@/lib/config/roles";
import type { PermissionWithRoles } from "@/lib/queries/asset/asset-detail";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { EditPermissionsForm } from "./actions/edit-form/form";
import { RevokeAllPermissionsForm } from "./actions/revoke-all-form/form";

const columnHelper = createColumnHelper<PermissionWithRoles>();

export function columns({ address }: { address: Address }) {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.bonds.permissions");

  return [
    columnHelper.accessor("id", {
      header: t("wallet-header"),
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
    columnHelper.accessor("roles", {
      header: t("roles-header"),
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue().map((role: Role) => (
            <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
              {getRoleDisplayName(role)}
            </span>
          ))}
        </div>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) =>
        getValue() ? formatDate(getValue(), { type: "distance" }) : "-",
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
          <DataTableRowActions>
            <EditPermissionsForm
              address={address}
              account={row.original.id}
              currentRoles={row.original.roles}
            />
            <RevokeAllPermissionsForm
              address={address}
              account={row.original.id}
              currentRoles={row.original.roles}
            />
          </DataTableRowActions>
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
