"use client";

import { EditPermissionsForm } from "@/components/blocks/asset-edit-permissions/form";
import { RevokeAllPermissionsForm } from "@/components/blocks/asset-revoke-all-permissions/form";
import { AssetRolePill } from "@/components/blocks/asset-role-pill/asset-role-pill";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { ROLES } from "@/lib/config/roles";
import { bondRevokeRoleAction } from "@/lib/mutations/asset/access-control/revoke-role/revoke-role-action";
import { bondUpdateAction } from "@/lib/mutations/asset/access-control/update-role/update-roles-action";
import type { PermissionWithRoles } from "@/lib/queries/asset/asset-detail";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

const columnHelper = createColumnHelper<PermissionWithRoles>();

export function columns({ address }: { address: Address }) {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.asset-permissions-tab");

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
      cell: ({ getValue }) => <AssetRolePill roles={getValue()} />,
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
      cell: ({ row, table }) => {
        const adminCount = table
          .getRowModel()
          .rows.filter((row) =>
            row.original.roles.includes(ROLES.DEFAULT_ADMIN_ROLE.contractRole)
          ).length;

        return (
          <DataTableRowActions
            actions={[
              {
                id: "edit-permissions",
                label: t("edit-form.trigger-label"),
                component: ({ open, onOpenChange }) => (
                  <EditPermissionsForm
                    address={address}
                    account={row.original.id}
                    currentRoles={row.original.roles}
                    open={open}
                    onOpenChange={onOpenChange}
                    updateRolesAction={bondUpdateAction}
                    adminsCount={adminCount}
                    assetName={row.original.assetName}
                  />
                ),
              },
              {
                id: "revoke-all-permissions",
                label: t("revoke-all-form.trigger-label"),
                component: ({ open, onOpenChange }) => (
                  <RevokeAllPermissionsForm
                    address={address}
                    account={row.original.id}
                    currentRoles={row.original.roles}
                    open={open}
                    onOpenChange={onOpenChange}
                    revokeRoleAction={bondRevokeRoleAction}
                  />
                ),
              },
            ]}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
