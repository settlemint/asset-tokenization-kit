import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { ClaimYieldSheet } from "@/components/manage-dropdown/sheets/claim-yield-sheet";
import { RedeemSheet } from "@/components/manage-dropdown/sheets/redeem-sheet";
import { TransferAssetSheet } from "@/components/manage-dropdown/sheets/transfer-asset-sheet";
import { useSession } from "@/hooks/use-auth";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { from, greaterThan } from "dnum";
import {
  Coins,
  Copy,
  Flame,
  HandCoins,
  Hash,
  Lock,
  Package,
  Send,
  Type,
  Unlock,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAddress } from "viem";

const columnHelper = createStrictColumnHelper<TokenBalance>();

enum AssetAction {
  Transfer,
  Redeem,
  ClaimYield,
}

/**
 * Initial sorting configuration for the user assets table
 * Sorts tokens by balance value in descending order (largest holdings first)
 */
const INITIAL_SORTING = [
  {
    id: "balance",
    desc: true,
  },
];

/**
 * A data table component for displaying user's token holdings
 *
 * This component provides a comprehensive table view of all tokens owned by the current user,
 * including features like sorting, filtering, pagination, bulk actions, and row actions.
 * Shows balance information including total, available, and frozen amounts.
 *
 * @returns {JSX.Element} A fully-featured data table displaying user's token assets
 *
 * @example
 * ```tsx
 * <UserAssetsTable />
 * ```
 */
export const UserAssetsTable = withErrorBoundary(function UserAssetsTable() {
  const router = useRouter();
  const { t } = useTranslation(["user-assets", "common"]);
  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;
  const { data: session } = useSession();
  const rawWallet = session?.user?.wallet ?? null;
  const holderWallet = useMemo<EthereumAddress | null>(() => {
    if (!rawWallet) return null;

    try {
      return getAddress(rawWallet);
    } catch {
      return null;
    }
  }, [rawWallet]);

  const { data: assets } = useSuspenseQuery(orpc.user.assets.queryOptions());
  const { data: claimYieldActions } = useSuspenseQuery(
    orpc.actions.list.queryOptions({
      input: {
        name: "ClaimYield",
      },
    })
  );
  const [selectedAsset, setSelectedAsset] = useState<TokenBalance | null>(null);
  const [selectedAction, setSelectedAction] = useState<AssetAction | null>(
    null
  );

  const openActionSheet = useCallback(
    (asset: TokenBalance, action: AssetAction) => {
      setSelectedAsset(asset);
      setSelectedAction(action);
    },
    []
  );

  const handleActionSheetClose = useCallback(() => {
    setSelectedAction(null);
    setSelectedAsset(null);
  }, []);

  /**
   * Creates action items for each row in the table
   *
   * @param {Object} row - The table row object
   * @param {TokenBalance} row.original - The original token balance data for the row
   * @returns {ActionItem[]} Array of action items including view details, copy address, and view on etherscan
   */
  const createRowActions = useCallback(
    (row: { original: TokenBalance }): ActionItem[] => {
      const hasTransferableBalance = greaterThan(
        row.original.available,
        from(0n, row.original.token.decimals)
      );

      const actions: ActionItem[] = [
        {
          label: t("user-assets:actions.transfer.label"),
          icon: <Send className="h-4 w-4" />,
          onClick: () => {
            openActionSheet(row.original, AssetAction.Transfer);
          },
          disabled: !hasTransferableBalance,
        },
      ];

      const canRedeem = row.original.token.bond?.isMatured;

      if (canRedeem) {
        actions.push({
          label: t("user-assets:actions.redeem.label"),
          icon: <Flame className="h-4 w-4" />,
          onClick: () => {
            openActionSheet(row.original, AssetAction.Redeem);
          },
        });
      }

      const canClaimYield = claimYieldActions.some(
        (action) =>
          action.target === row.original.token.yield?.schedule?.id &&
          action.status !== "EXECUTED" &&
          action.activeAt.getTime() <= Date.now()
      );
      if (canClaimYield) {
        actions.push({
          label: t("user-assets:actions.claimYield.label"),
          icon: <HandCoins className="h-4 w-4" />,
          onClick: () => {
            openActionSheet(row.original, AssetAction.ClaimYield);
          },
        });
      }

      return actions;
    },
    [openActionSheet, t, claimYieldActions]
  );

  /**
   * Defines the column configuration for the user assets table
   *
   * Includes columns for selection, token info, balances, and actions.
   * Uses withAutoFeatures to enhance columns with automatic filtering and sorting capabilities.
   *
   * @returns {ColumnDef<TokenBalance>[]} Array of column definitions for the table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("token.id", {
          header: t("user-assets:columns.contractAddress"),
          meta: {
            displayName: t("user-assets:columns.contractAddress"),
            type: "address",
            icon: Copy,
          },
        }),
        columnHelper.accessor("token.name", {
          id: "name",
          header: t("user-assets:columns.tokenName"),
          meta: {
            displayName: t("user-assets:columns.tokenName"),
            type: "text",
            icon: Type,
          },
        }),
        columnHelper.accessor("token.symbol", {
          id: "symbol",
          header: t("user-assets:columns.symbol"),
          meta: {
            displayName: t("user-assets:columns.symbol"),
            type: "text",
            icon: Coins,
          },
        }),
        columnHelper.display({
          id: "balance",
          header: t("user-assets:columns.balance"),
          cell: ({ row }) => {
            return formatValue(row.original.value, {
              type: "currency",
              currency: { assetSymbol: row.original.token.symbol },
            });
          },
          meta: {
            displayName: t("user-assets:columns.balance"),
            type: "none",
            icon: Wallet,
          },
        }),
        columnHelper.display({
          id: "available",
          header: t("user-assets:columns.available"),
          cell: ({ row }) => {
            return formatValue(row.original.available, {
              type: "currency",
              currency: { assetSymbol: row.original.token.symbol },
            });
          },
          meta: {
            displayName: t("user-assets:columns.available"),
            type: "none",
            icon: Unlock,
          },
        }),
        columnHelper.display({
          id: "frozen",
          header: t("user-assets:columns.frozen"),
          cell: ({ row }) => {
            return formatValue(row.original.frozen, {
              type: "currency",
              currency: { assetSymbol: row.original.token.symbol },
            });
          },
          meta: {
            displayName: t("user-assets:columns.frozen"),
            type: "none",
            icon: Lock,
          },
        }),
        columnHelper.display({
          id: "totalSupply",
          header: t("user-assets:columns.totalSupply"),
          cell: ({ row }) => {
            return formatValue(row.original.token.totalSupply, {
              type: "currency",
              currency: { assetSymbol: row.original.token.symbol },
            });
          },
          meta: {
            displayName: t("user-assets:columns.totalSupply"),
            type: "none",
            icon: Hash,
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("user-assets:columns.actions"),
          meta: {
            type: "none",
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<TokenBalance>[]),
    [t, createRowActions]
  );

  return (
    <>
      <DataTable
        name="user-assets"
        data={assets}
        columns={columns}
        urlState={{
          enabled: true,
          enableUrlPersistence: true,
          routePath,
          defaultPageSize: 20,
          enableGlobalFilter: true,
          enableRowSelection: true,
          debounceMs: 300,
        }}
        initialColumnVisibility={{
          name: false,
        }}
        advancedToolbar={{
          enableGlobalSearch: true,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("user-assets:searchPlaceholder"),
        }}
        bulkActions={{
          enabled: false,
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={INITIAL_SORTING}
        customEmptyState={{
          title: t("user-assets:emptyState.title"),
          description: t("user-assets:emptyState.description"),
          icon: Package,
        }}
      />

      {selectedAsset ? (
        <TransferAssetSheet
          open={selectedAction === AssetAction.Transfer}
          onClose={handleActionSheetClose}
          assetBalance={selectedAsset}
        />
      ) : null}

      {selectedAsset ? (
        <RedeemSheet
          open={selectedAction === AssetAction.Redeem}
          onClose={handleActionSheetClose}
          assetBalance={selectedAsset}
          holderAddress={holderWallet}
        />
      ) : null}
      {selectedAsset ? (
        <ClaimYieldSheet
          open={selectedAction === AssetAction.ClaimYield}
          onClose={handleActionSheetClose}
          assetBalance={selectedAsset}
        />
      ) : null}
    </>
  );
});
