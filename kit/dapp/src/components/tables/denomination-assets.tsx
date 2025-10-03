import {
  ActionsCell,
  type ActionItem,
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
import type { DenominationAssetList } from "@/orpc/routes/token/routes/token.denomination-assets.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  PauseCircle,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type DenominationAsset = DenominationAssetList[number];

const columnHelper = createStrictColumnHelper<DenominationAsset>();

/**
 * Initial sorting configuration for the denomination assets table
 * Sorts by creation date in descending order by default (most recent first)
 */
const INITIAL_SORTING = [
  {
    id: "name",
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
    data: denominationAssetsData,
    isLoading,
    error,
  } = useSuspenseQuery(
    orpc.token.denominationAssets.queryOptions({
      input: { tokenAddress },
    })
  );

  const denominationAssets = denominationAssetsData || [];

  // Copy to clipboard utility
  const copyToClipboard = useCallback(
    (text: string) => {
      void navigator.clipboard.writeText(text);
      toast.success(t("actions.addressCopied"));
    },
    [t]
  );

  // Navigate to external explorer
  const openInExplorer = useCallback((address: string) => {
    const explorerUrl = `https://etherscan.io/address/${address}`;
    void window.open(explorerUrl, "_blank");
  }, []);

  // Navigate to token details
  const navigateToToken = useCallback(
    (factoryAddress: string, tokenAddress: string) => {
      void router.navigate({
        to: "/token/$factoryAddress/$tokenAddress",
        params: {
          factoryAddress: factoryAddress as EthereumAddress,
          tokenAddress: tokenAddress as EthereumAddress,
        },
      });
    },
    [router]
  );

  // Column definitions
  const columns = useMemo(() => {
    return withAutoFeatures([
      createSelectionColumn<DenominationAsset>(),
      columnHelper.accessor("id", {
        header: t("columns.contractAddress"),
        meta: {
          displayName: t("columns.contractAddress"),
          type: "address",
          icon: Copy,
        },
      }),
      columnHelper.accessor("name", {
        header: t("columns.name"),
        meta: {
          displayName: t("columns.tokenName"),
          type: "text",
          icon: Type,
        },
      }),
      columnHelper.accessor("symbol", {
        header: t("columns.symbol"),
        meta: {
          displayName: t("columns.tokenSymbol"),
          type: "text",
          icon: Coins,
        },
      }),
      columnHelper.accessor("decimals", {
        header: t("columns.decimals"),
        meta: {
          displayName: t("columns.decimals"),
          type: "number",
          icon: Hash,
          max: 18,
        },
      }),
      columnHelper.display({
        id: "totalSupply",
        header: t("columns.totalSupply"),
        cell: ({ row }) => {
          return formatValue(row.original.totalSupply, {
            type: "currency",
            currency: { assetSymbol: row.original.symbol },
          });
        },
        meta: {
          displayName: t("columns.totalSupply"),
          type: "none",
          icon: Coins,
        },
      }),
      columnHelper.display({
        id: "paused",
        header: t("columns.paused"),
        cell: ({ row }) => {
          const paused = row.original.pausable.paused;
          return <TokenStatusBadge paused={paused} />;
        },
        meta: {
          displayName: t("columns.paused"),
          type: "none",
          icon: PauseCircle,
        },
      }),
      // Actions
      columnHelper.display({
        id: "actions",
        header: () => t("columns.actions"),
        cell: ({ row }) => {
          const denominationAsset = row.original;
          const actions: ActionItem[] = [
            {
              label: t("actions.viewDetails"),
              icon: <Eye className="h-4 w-4" />,
              onClick: () => {
                navigateToToken(
                  denominationAsset.tokenFactory.id,
                  denominationAsset.id
                );
              },
            },
            {
              label: t("actions.copyAddress"),
              icon: <Copy className="h-4 w-4" />,
              onClick: () => {
                copyToClipboard(denominationAsset.id);
              },
            },
            {
              label: t("actions.viewOnEtherscan"),
              icon: <ExternalLink className="h-4 w-4" />,
              onClick: () => {
                openInExplorer(denominationAsset.id);
              },
            },
          ];

          return <ActionsCell actions={actions} />;
        },
      }),
    ]);
  }, [t, copyToClipboard, openInExplorer, navigateToToken]);

  // Bulk actions configuration
  const { actions, actionGroups } = useBulkActions<DenominationAsset>({});

  if (error) {
    throw error;
  }

  return (
    <ComponentErrorBoundary>
      <DataTable
        name="denomination-assets"
        data={denominationAssets}
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
      />
    </ComponentErrorBoundary>
  );
}
