import {
  ActionsCell,
  type ActionItem,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { BlocklistSheet } from "@/components/manage-dropdown/sheets/blocklist-sheet";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type BlocklistRow = {
  id: string;
};

const columnHelper = createColumnHelper<BlocklistRow>();

export function TokenBlocklistTable({ token }: { token: Token }) {
  const { t } = useTranslation(["tokens", "common", "form"]);

  // Fetch token holders to get frozen addresses
  const { data: holdersData } = useQuery(
    orpc.token.holders.queryOptions({
      input: { tokenAddress: token.id },
    })
  );

  const [openSheet, setOpenSheet] = useState(false);
  const [sheetPreset, setSheetPreset] = useState<EthereumAddress | undefined>(
    undefined
  );
  const [sheetMode, setSheetMode] = useState<"add" | "remove">("add");

  const canManageBlocklist = Boolean(
    token.userPermissions?.actions.freezeAddress
  );

  // Extract frozen addresses from holders data
  const rows: BlocklistRow[] = useMemo(() => {
    if (!holdersData?.token?.balances) return [];
    return holdersData.token.balances
      .filter((balance) => balance.isFrozen)
      .map((balance) => ({ id: balance.account.id }));
  }, [holdersData]);

  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("id", {
          header: t("tokens:blocklist.columns.address"),
          cell: ({ getValue }) => (
            <Web3Address
              address={getEthereumAddress(getValue())}
              copyToClipboard
              size="tiny"
              showFullAddress={false}
            />
          ),
          meta: {
            displayName: t("tokens:blocklist.columns.address"),
            type: "address",
          },
        }) as unknown as ColumnDef<BlocklistRow>,
        {
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <RowActions
              row={row.original}
              canManage={canManageBlocklist}
              onRemove={() => {
                setSheetMode("remove");
                setSheetPreset(getEthereumAddress(row.original.id));
                setOpenSheet(true);
              }}
            />
          ),
          meta: { type: "text", enableCsvExport: false },
        } as ColumnDef<BlocklistRow>,
      ]),
    [t, canManageBlocklist]
  );

  return (
    <ComponentErrorBoundary>
      <BlocklistSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        asset={token}
        presetAddress={sheetPreset}
        defaultMode={sheetMode}
        onCompleted={() => {
          // Data will refresh automatically through query invalidation
        }}
      />
      <DataTable
        name="token-blocklist"
        data={rows}
        columns={columns}
        initialSorting={[
          {
            id: "id",
            desc: false,
          },
        ]}
        advancedToolbar={{
          enableGlobalSearch: true,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          customActions: (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSheetMode("add");
                  setSheetPreset(undefined);
                  setOpenSheet(true);
                }}
                disabled={!canManageBlocklist}
              >
                {t("tokens:blocklist.addAddress")}
              </Button>
            </div>
          ),
          placeholder: t("tokens:blocklist.searchPlaceholder"),
        }}
      />
    </ComponentErrorBoundary>
  );
}

function RowActions({
  canManage,
  onRemove,
}: {
  row: BlocklistRow;
  canManage: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation(["tokens", "common"]);

  const actions: ActionItem[] = [
    {
      label: t("tokens:blocklist.removeAddress"),
      onClick: onRemove,
      disabled: !canManage,
    },
  ];

  return <ActionsCell actions={actions} />;
}
