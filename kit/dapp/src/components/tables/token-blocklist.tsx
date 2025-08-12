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
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { ShieldBan } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type BlocklistRow = {
  id: string;
};

const columnHelper = createColumnHelper<BlocklistRow>();

export function TokenBlocklistTable({ token }: { token: Token }) {
  const { t } = useTranslation(["tokens", "common", "form"]);

  // Placeholder until token.read includes blocklisted addresses from subgraph
  const [rows, setRows] = useState<BlocklistRow[]>([]);
  const [openSheet, setOpenSheet] = useState(false);
  const [sheetPreset, setSheetPreset] = useState<EthereumAddress | undefined>(
    undefined
  );
  const [sheetMode, setSheetMode] = useState<"add" | "remove">("add");

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
    [t]
  );

  return (
    <ComponentErrorBoundary>
      <BlocklistSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        asset={token}
        presetAddress={sheetPreset}
        defaultMode={sheetMode}
        onCompleted={({ address, mode }) => {
          setRows((prev) => {
            if (mode === "add") {
              return prev.some(
                (r) => r.id.toLowerCase() === address.toLowerCase()
              )
                ? prev
                : [...prev, { id: address }];
            }
            // remove
            return prev.filter(
              (r) => r.id.toLowerCase() !== address.toLowerCase()
            );
          });
        }}
      />
      <DataTable
        name="token-blocklist"
        data={rows}
        columns={columns}
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
              >
                {t("tokens:blocklist.addAddress")}
              </Button>
            </div>
          ),
          placeholder: t("tokens:blocklist.searchPlaceholder"),
        }}
        customEmptyState={{
          icon: ShieldBan,
          title: t("tokens:blocklist.empty.title"),
          description: t("tokens:blocklist.empty.description"),
        }}
      />
    </ComponentErrorBoundary>
  );
}

function RowActions({ onRemove }: { row: BlocklistRow; onRemove: () => void }) {
  const { t } = useTranslation(["tokens", "common"]);

  const actions: ActionItem[] = [
    {
      label: t("tokens:blocklist.removeAddress"),
      onClick: onRemove,
    },
  ];

  return <ActionsCell actions={actions} />;
}
