import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  Package,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// logger reserved for future debug
// const logger = createLogger();

/**
 * GraphQL query result for bonds using this denomination asset
 */
interface DenominationAssetBond {
  id: string;
  token: {
    id: EthereumAddress;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    pausable: {
      paused: boolean;
    };
    factory: {
      id: EthereumAddress;
      name: string;
    };
  };
  faceValue: string;
  maturityDate: string;
  isMatured: boolean;
  denominationAssetNeeded: string;
}

type Bond = DenominationAssetBond;

const columnHelper = createStrictColumnHelper<Bond>();

/**
 * Initial sorting configuration for the denomination assets table
 * Sorts by creation date in descending order by default (most recent first)
 */
const INITIAL_SORTING = [
  {
    id: "token.name",
    desc: false,
  },
];

interface DenominationAssetTableProps {
  tokenAddress: EthereumAddress;
}

export function DenominationAssetTable({
  tokenAddress,
}: DenominationAssetTableProps) {
  const { t } = useTranslation("tokens");
  const router = useRouter();

  // Fetch bonds that use this token as denomination asset
  const {
    data: bondsData,
    isLoading,
    error,
  } = useSuspenseQuery(
    orpc.token.denominationAssets.queryOptions({
      input: { tokenAddress },
    })
  );

  const bonds = bondsData || [];

  // Copy to clipboard utility
  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success(t("actions.addressCopied"));
    },
    [t]
  );

  // Navigate to external explorer
  const openInExplorer = useCallback((address: string) => {
    const explorerUrl = `https://etherscan.io/address/${address}`;
    window.open(explorerUrl, "_blank");
  }, []);

  // Navigate to token details
  const navigateToToken = useCallback(
    (factoryAddress: EthereumAddress, tokenAddress: EthereumAddress) => {
      router.navigate({
        to: "/token/$factoryAddress/$tokenAddress",
        params: { factoryAddress, tokenAddress },
      });
    },
    [router]
  );

  // Column definitions
  const columns = useMemo<ColumnDef<Bond>[]>(() => {
    const baseColumns: ColumnDef<Bond>[] = [
      createSelectionColumn<Bond>(),

      // Asset Name
      columnHelper.display({
        id: "name",
        header: (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t("fields.name")}
          </div>
        ),
        cell: ({ row }) => {
          const bond = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{bond.token.name}</span>
                <span className="text-sm text-muted-foreground">
                  {bond.token.symbol}
                </span>
              </div>
            </div>
          );
        },
      }),

      // Factory
      columnHelper.display({
        id: "factory",
        header: (
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Factory
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.token.factory.name}</span>
        ),
      }),

      // Face Value
      columnHelper.display({
        id: "faceValue",
        header: (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            {t("fields.faceValue")}
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatValue(row.original.faceValue, { type: "number" })}
          </span>
        ),
      }),

      // Total Supply
      columnHelper.display({
        id: "totalSupply",
        header: (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {t("fields.totalSupply")}
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatValue(row.original.token.totalSupply, {
              type: "currency",
              currency: { assetSymbol: row.original.token.symbol },
            })}
          </span>
        ),
      }),

      // Maturity Date
      columnHelper.display({
        id: "maturityDate",
        header: (
          <div className="flex items-center gap-2">
            {t("fields.maturityDate")}
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {formatValue(row.original.maturityDate, {
              type: "date",
              dateOptions: { includeTime: true },
            })}
          </span>
        ),
      }),

      // Status
      columnHelper.display({
        id: "status",
        header: t("fields.status"),
        cell: ({ row }) => {
          const paused = row.original.token.pausable.paused;
          const isMatured = row.original.isMatured;
          return (
            <div className="flex items-center gap-2">
              <TokenStatusBadge paused={paused} />
              {isMatured && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {t("status.matured")}
                </span>
              )}
            </div>
          );
        },
      }),

      // Actions
      columnHelper.display({
        id: "actions",
        header: () => t("columns.actions"),
        cell: ({ row }) => {
          const bond = row.original;
          const actions: ActionItem[] = [
            {
              label: t("actions.viewDetails"),
              icon: <Eye className="h-4 w-4" />,
              onClick: () => {
                navigateToToken(bond.token.factory.id, bond.token.id);
              },
            },
            {
              label: t("actions.copyAddress"),
              icon: <Copy className="h-4 w-4" />,
              onClick: () => {
                copyToClipboard(bond.token.id);
              },
            },
            {
              label: t("actions.viewOnEtherscan"),
              icon: <ExternalLink className="h-4 w-4" />,
              onClick: () => {
                openInExplorer(bond.token.id);
              },
            },
          ];

          return <ActionsCell actions={actions} />;
        },
      }),
    ];

    return withAutoFeatures(baseColumns);
  }, [t, copyToClipboard, openInExplorer, navigateToToken]);

  // Bulk actions configuration
  const { actions, actionGroups } = useBulkActions<Bond>({});

  if (error) {
    throw error;
  }

  return (
    <ComponentErrorBoundary>
      <DataTable
        name="denomination-assets"
        data={bonds}
        columns={columns}
        isLoading={isLoading}
        initialSorting={INITIAL_SORTING}
        bulkActions={{
          enabled: true,
          actions,
          actionGroups,
          position: "bottom",
          showSelectionCount: true,
          enableSelectAll: true,
        }}
        meta={{
          title: t("tabs.denominationAsset"),
          description: t("descriptions.denominationAssetTable"),
        }}
      />
    </ComponentErrorBoundary>
  );
}
