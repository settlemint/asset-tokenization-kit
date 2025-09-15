import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Coins,
  Copy,
  Eye,
  Hash,
  Lock,
  Package,
  Type,
  Unlock,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

const columnHelper = createStrictColumnHelper<TokenBalance>();

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
export function UserAssetsTable() {
  const router = useRouter();
  const { t } = useTranslation(["user-assets", "common"]);
  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;

  const { data: assets } = useSuspenseQuery(orpc.user.assets.queryOptions());
  /**
   * Creates action items for each row in the table
   *
   * @param {Object} row - The table row object
   * @param {TokenBalance} row.original - The original token balance data for the row
   * @returns {ActionItem[]} Array of action items including view details, copy address, and view on etherscan
   */
  const createRowActions = useCallback(
    (row: { original: TokenBalance }): ActionItem[] => [
      {
        label: t("user-assets:actions.viewTokenDetails"),
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          logger.debug("View token details onClick triggered");
          // Navigate to a token details page if it exists
          // This would need to be implemented based on your routing structure
          toast.info(t("user-assets:actions.tokenDetailsNotImplemented"));
        },
      },
      {
        label: t("user-assets:actions.copyAddress"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.token.id);
          toast.success(t("user-assets:actions.addressCopied"));
        },
      },
    ],
    [t]
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
    <ComponentErrorBoundary componentName="User Assets Table">
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
    </ComponentErrorBoundary>
  );
}
