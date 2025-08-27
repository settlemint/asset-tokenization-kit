import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { ColumnDef } from "@tanstack/react-table";
import { Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
//
import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { ChangeRolesSheet } from "@/components/manage-dropdown/sheets/change-roles-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

type PermissionRow = {
  id: string;
  roles: AccessControlRoles[];
};

const columnHelper = createStrictColumnHelper<PermissionRow>();

function toLabel(role: string) {
  // Convert camelCase/pascalCase to spaced Title Case for display
  const spaced = role.replaceAll(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function TokenPermissionsTable({ token }: { token: Token }) {
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
        }) as unknown as ColumnDef<PermissionRow>,
        columnHelper.display({
          id: "roles",
          header: t("tokens:permissions.columns.roles"),
          cell: ({ row }) => {
            const roles = row.original.roles;
            if (!roles?.length) return <span>-</span>;
            return (
              <div className="flex flex-wrap gap-1">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary">
                    {toLabel(r)}
                  </Badge>
                ))}
              </div>
            );
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) =>
            (rowB.original.roles?.length ?? 0) -
            (rowA.original.roles?.length ?? 0),
          meta: {
            displayName: t("tokens:permissions.columns.roles"),
            type: "text",
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
    <ComponentErrorBoundary>
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
          customActions: (
            <Button
              size="sm"
              onClick={() => {
                setPresetAccount(undefined);
                setOpenChangeRoles(true);
              }}
              disabled={!canGrant}
            >
              {t("tokens:permissions.changeRoles.cta")}
            </Button>
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
      <ChangeRolesSheet
        open={openChangeRoles}
        onOpenChange={setOpenChangeRoles}
        asset={token}
        presetAccount={presetAccount}
      />
    </ComponentErrorBoundary>
  );
}

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
        onOpenChangeRoles(row.id as unknown as EthereumAddress);
      },
      disabled: !canChangeRoles,
    },
  ];

  return <ActionsCell actions={actions} />;
}

function RowActionSheets(_props: { token: Token }) {
  // Placeholder in case we need global sheets/state later
  return null;
}
