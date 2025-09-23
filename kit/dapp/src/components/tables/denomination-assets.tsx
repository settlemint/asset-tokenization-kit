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
import { createLogger } from "@settlemint/sdk-utils/logging";
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

const logger = createLogger();

/**
 * GraphQL query result for bonds using this denomination asset
 */
interface DenominationAssetBond {
  id: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    pausable: {
      paused: boolean;
    };
    factory: {
      id: string;
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
  const { t } = useTranslation([
    "tokens",
    "assets",
    "common",
    "data-table",
    "stats",
  ]);
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
      toast.success(t("common:copied"));
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
    (factoryAddress: string, tokenAddress: string) => {
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
      // Selection column for bulk actions
      createSelectionColumn<Bond>(),

      // Asset Name
      columnHelper.accessor("token.name", {
        id: "name",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t("tokens:fields.name")}
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
      columnHelper.accessor("token.factory.name", {
        id: "factory",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            {t("tokens:fields.factory")}
          </div>
        ),
        cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
      }),

      // Face Value
      columnHelper.accessor("faceValue", {
        id: "faceValue",
        header: () => (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            {t("tokens:fields.faceValue")}
          </div>
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className="font-mono text-sm">
              {formatValue(value, { type: "bigint", decimals: 18 })}
            </span>
          );
        },
      }),

      // Total Supply
      columnHelper.accessor("token.totalSupply", {
        id: "totalSupply",
        header: () => (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            {t("tokens:fields.totalSupply")}
          </div>
        ),
        cell: ({ getValue, row }) => {
          const value = getValue();
          const decimals = row.original.token.decimals;
          return (
            <span className="font-mono text-sm">
              {formatValue(value, { type: "bigint", decimals })}
            </span>
          );
        },
      }),

      // Maturity Date
      columnHelper.accessor("maturityDate", {
        id: "maturityDate",
        header: () => (
          <div className="flex items-center gap-2">
            {t("tokens:fields.maturityDate")}
          </div>
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className="text-sm">
              {formatValue(value, { type: "date", includeTime: true })}
            </span>
          );
        },
      }),

      // Status
      columnHelper.accessor("token.pausable.paused", {
        id: "status",
        header: () => t("tokens:fields.status"),
        cell: ({ getValue, row }) => {
          const paused = getValue();
          const isMatured = row.original.isMatured;
          return (
            <div className="flex items-center gap-2">
              <TokenStatusBadge paused={paused} />
              {isMatured && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {t("tokens:status.matured")}
                </span>
              )}
            </div>
          );
        },
      }),

      // Actions
      columnHelper.display({
        id: "actions",
        header: () => t("data-table:actions"),
        cell: ({ row }) => {
          const bond = row.original;
          const actions: ActionItem[] = [
            {
              label: t("common:view"),
              icon: Eye,
              onClick: () => {
                navigateToToken(bond.token.factory.id, bond.token.id);
              },
            },
            {
              label: t("common:copyAddress"),
              icon: Copy,
              onClick: () => {
                copyToClipboard(bond.token.id);
              },
            },
            {
              label: t("common:viewOnExplorer"),
              icon: ExternalLink,
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
  const bulkActions = useBulkActions<Bond>({
    actions: [
      {
        label: t("common:copyAddresses"),
        icon: Copy,
        onClick: (selectedRows) => {
          const addresses = selectedRows.map((row) => row.original.token.id);
          copyToClipboard(addresses.join("\n"));
        },
      },
    ],
  });

  if (error) {
    throw error;
  }

  return (
    <ComponentErrorBoundary>
      <DataTable
        data={bonds}
        columns={columns}
        isLoading={isLoading}
        initialSorting={INITIAL_SORTING}
        bulkActions={bulkActions}
        meta={{
          title: t("tokens:tabs.denominationAsset"),
          description: t("tokens:descriptions.denominationAssetTable"),
        }}
      />
    </ComponentErrorBoundary>
  );
}
