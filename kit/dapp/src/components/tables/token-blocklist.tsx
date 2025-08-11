import { AddressInput } from "@/components/address/address-input";
import { AddressSelect } from "@/components/address/address-select";
import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import {
  ActionsCell,
  type ActionItem,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { ShieldBan } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAddress } from "viem";

type BlocklistRow = {
  id: string;
};

const columnHelper = createColumnHelper<BlocklistRow>();

export function TokenBlocklistTable({ token }: { token: Token }) {
  const { t } = useTranslation(["tokens", "common", "form"]);

  // Placeholder until token.read includes blocklisted addresses from subgraph
  const [rows, setRows] = useState<BlocklistRow[]>([]);
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");
  const [pendingAddress, setPendingAddress] = useState<string>("");

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
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
              }}
            />
          ),
          meta: { type: "text", enableCsvExport: false },
        } as ColumnDef<BlocklistRow>,
      ]),
    [t]
  );

  const addAddress = (addr: string | undefined) => {
    if (!addr || !isAddress(addr)) return;
    setRows((prev) =>
      prev.some((r) => r.id.toLowerCase() === addr.toLowerCase())
        ? prev
        : [...prev, { id: addr }]
    );
    setPendingAddress("");
  };

  return (
    <ComponentErrorBoundary>
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
              <AddressSelectOrInputToggle onModeChange={setInputMode}>
                {({ mode }) => (
                  <>
                    {mode === "select" && (
                      <AddressSelect
                        value={undefined}
                        onChange={(addr) => addAddress(addr)}
                        scope="user"
                        placeholder={t("form:address.selectAddress")}
                      />
                    )}
                    {mode === "manual" && (
                      <AddressInput
                        value={pendingAddress}
                        onChange={setPendingAddress}
                        placeholder={t("form:address.enterAddress")}
                      />
                    )}
                  </>
                )}
              </AddressSelectOrInputToggle>
              <Button
                size="sm"
                onClick={() => addAddress(pendingAddress)}
                disabled={!isAddress(pendingAddress)}
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

function RowActions({
  row,
  onRemove,
}: {
  row: BlocklistRow;
  onRemove: () => void;
}) {
  const { t } = useTranslation(["tokens", "common"]);

  const actions: ActionItem[] = [
    {
      label: t("tokens:blocklist.removeAddress"),
      onClick: onRemove,
    },
  ];

  return <ActionsCell actions={actions} />;
}
