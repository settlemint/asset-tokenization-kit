import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { ChangeTokenRolesSheet } from "@/components/manage-dropdown/sheets/change-role/change-token-roles-sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type PermissionRow = {
  id: string;
  roles: string[];
};

const columnHelper = createStrictColumnHelper<PermissionRow>();

export const TokenPermissionsTable = withErrorBoundary(
  function TokenPermissionsTable({ token }: { token: Token }) {
    const { t } = useTranslation(["tokens", "common"]);
    const [openChangeRoles, setOpenChangeRoles] = useState(false);
    const [presetAccount, setPresetAccount] = useState<
      EthereumAddress | undefined
    >(undefined);
    const canGrant = token.userPermissions?.actions.grantRole ?? false;

    const rows: PermissionRow[] = useMemo(() => {
      const map = new Map<string, Set<AccessControlRoles>>();
      for (const [role, accounts] of getAccessControlEntries(
        token.accessControl
      )) {
        for (const account of accounts) {
          const set = map.get(account.id) ?? new Set<AccessControlRoles>();
          set.add(role);
          map.set(account.id, set);
        }
      }
      return [...map.entries()].map(([id, roles]) => ({
        id,
        roles: [...roles.values()],
      }));
    }, [token.accessControl]);

    const columns = useMemo(
      () =>
        withAutoFeatures([
          columnHelper.accessor("id", {
            header: t("tokens:permissions.columns.address"),
            meta: {
              displayName: t("tokens:permissions.columns.address"),
              type: "address",
            },
          }),
          columnHelper.accessor("roles", {
            id: "roles",
            header: t("tokens:permissions.columns.roles"),
            filterFn: (
              row,
              _id,
              value: {
                operator: "include";
                values: [string[]];
              }
            ) => {
              const roles = new Set(
                row.original.roles.map((item) => item.toLowerCase())
              );
              return value.values[0]?.every((valueFilter) =>
                roles.has(valueFilter.toLowerCase())
              );
            },
            enableSorting: true,
            sortingFn: (rowA, rowB) =>
              (rowB.original.roles?.length ?? 0) -
              (rowA.original.roles?.length ?? 0),
            meta: {
              displayName: t("tokens:permissions.columns.roles"),
              type: "multiOption",
              multiOptionOptions: {
                getLabel: (value: AccessControlRoles) =>
                  t(
                    `common:roles.${value.toLowerCase() as Lowercase<AccessControlRoles>}.title`
                  ),
              },
              transformOptionFn: (value) => ({
                label: t(
                  `common:roles.${value.toLowerCase() as Lowercase<AccessControlRoles>}.title`
                ),
                value: value,
              }),
            },
          }),
          columnHelper.display({
            id: "actions",
            header: "",
            cell: ({ row }) => (
              <RowActions
                token={token}
                row={row.original}
                onOpenChangeRoles={(account: EthereumAddress) => {
                  setPresetAccount(account);
                  setOpenChangeRoles(true);
                }}
              />
            ),
            meta: { type: "none", enableCsvExport: false },
          }),
        ]),
      [t, token]
    );

    return (
      <>
        <RowActionSheets token={token} />
        <DataTable
          name="token-permissions"
          data={rows}
          columns={columns}
          advancedToolbar={{
            enableGlobalSearch: true,
            enableFilters: true,
            enableExport: true,
            enableViewOptions: true,
            customActions: canGrant ? (
              <Button
                size="sm"
                onClick={() => {
                  setPresetAccount(undefined);
                  setOpenChangeRoles(true);
                }}
              >
                {t("tokens:permissions.changeRoles.cta")}
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger className="pointer-events-auto">
                  <Button size="sm" disabled={true}>
                    {t("tokens:permissions.changeRoles.cta")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {t("tokens:permissions.changeRoles.notAuthorized")}
                </TooltipContent>
              </Tooltip>
            ),
            placeholder: t("tokens:permissions.searchPlaceholder"),
          }}
          initialSorting={[
            {
              id: "roles",
              desc: true,
            },
          ]}
          customEmptyState={{
            icon: Shield,
            title: t("tokens:permissions.empty.title"),
            description: t("tokens:permissions.empty.description"),
          }}
        />
        <ChangeTokenRolesSheet
          open={openChangeRoles}
          onOpenChange={setOpenChangeRoles}
          asset={token}
          presetAccount={presetAccount}
        />
      </>
    );
  }
);

function RowActions({
  token,
  row,
  onOpenChangeRoles,
}: {
  token: Token;
  row: PermissionRow;
  onOpenChangeRoles: (account: EthereumAddress) => void;
}) {
  const { t } = useTranslation(["tokens", "common"]);
  const canGrantRole = token.userPermissions?.actions.grantRole ?? false;
  const canRevokeRole = token.userPermissions?.actions.revokeRole ?? false;
  const canChangeRoles = canGrantRole || canRevokeRole; // Can do either action

  const actions: ActionItem[] = [
    {
      label: t("tokens:permissions.changeRoles.cta"),
      onClick: () => {
        onOpenChangeRoles(row.id as EthereumAddress);
      },
      disabled: !canChangeRoles,
      disabledMessage: t("tokens:permissions.changeRoles.notAuthorized"),
    },
  ];

  return <ActionsCell actions={actions} />;
}

function RowActionSheets(_props: { token: Token }) {
  // Placeholder in case we need global sheets/state later
  return null;
}
