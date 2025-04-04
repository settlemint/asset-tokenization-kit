"use client";

import { EditPermissionsForm } from "@/components/blocks/asset-edit-permissions/form";
import { RevokeAllPermissionsForm } from "@/components/blocks/asset-revoke-all-permissions/form";
import { AssetRolePill } from "@/components/blocks/asset-role-pill/asset-role-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { ROLES } from "@/lib/config/roles";
import { defineMeta, filterFn } from "@/lib/filters";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import type { PermissionWithRoles } from "@/lib/queries/asset/asset-users-detail";
import { formatDate } from "@/lib/utils/date";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ClockIcon, MoreHorizontal, UsersIcon, WalletIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.users.permissions.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("asset.id", {
      header: t("columns.asset-header"),
      cell: ({ getValue }) => {
        const address = getValue() as Address;
        return (
          <EvmAddress address={address} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={address} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
      meta: defineMeta((row) => row.asset.id, {
        displayName: t("columns.asset-header"),
        icon: WalletIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("roles", {
      header: t("columns.roles-header"),
      cell: ({ getValue }) => <AssetRolePill roles={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("multiOption"),
      meta: defineMeta((row) => row.roles, {
        displayName: t("columns.roles-header"),
        icon: UsersIcon,
        type: "multiOption",
        options: Object.values(ROLES).map((role) => ({
          label: role.displayName,
          value: role.contractRole,
        })),
      }),
    }),
    columnHelper.accessor("lastActivity", {
      header: t("columns.last-activity-header"),
      cell: ({ getValue }) =>
        getValue()
          ? formatDate(getValue(), { type: "distance", locale: locale })
          : "-",
      enableColumnFilter: false,
      meta: defineMeta((row) => row.lastActivity, {
        displayName: t("columns.last-activity-header"),
        icon: ClockIcon,
        type: "date",
      }),
    }),
    columnHelper.display({
      id: "actions",
      header: t("columns.actions-header"),
      cell: ({ row }) => {
        const isOnlyAdmin =
          row.original.asset.admins.length === 1 &&
          row.original.roles.includes(ROLES.DEFAULT_ADMIN_ROLE.contractRole);
        return (
          <DataTableRowActions
            actions={[
              {
                id: "edit-permissions",
                label: t("actions.edit-roles"),
                component: ({ open, onOpenChange }) => (
                  <EditPermissionsForm
                    address={row.original.asset.id}
                    account={row.original.account.id}
                    currentRoles={row.original.roles}
                    open={open}
                    onOpenChange={onOpenChange}
                    assettype={row.original.asset.type}
                    disableEditAdminRole={isOnlyAdmin}
                    assetName={row.original.asset.name}
                  />
                ),
              },
              {
                id: "revoke-all-permissions",
                label: t("actions.revoke-all"),
                component: ({ open, onOpenChange }) => (
                  <RevokeAllPermissionsForm
                    address={row.original.asset.id}
                    account={row.original.account.id}
                    currentRoles={row.original.roles}
                    open={open}
                    onOpenChange={onOpenChange}
                    assettype={row.original.asset.type}
                  />
                ),
                disabled: isOnlyAdmin,
              },
            ]}
          />
        );
      },
      meta: {
        displayName: "Actions",
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as ColumnMeta<PermissionWithRoles, unknown>,
    }),
  ];
}
