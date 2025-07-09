import {
  ActionsCell,
  type ActionItem,
} from "@/components/data-table/cells/actions-cell";
import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc";
import type { TokenBalance } from "@/orpc/routes/token/routes/token.holders.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { format } from "dnum";
import {
  AlertCircle,
  Coins,
  Lock,
  Wallet,
  User,
  Copy,
  ExternalLink,
  UserCircle,
  CircleX,
  CircleCheck,
} from "lucide-react";
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const columnHelper = createColumnHelper<TokenBalance>();

/**
 * Initial sorting configuration for the holders table
 * Sorts holders by lastUpdatedAt in descending order by default
 */
const INITIAL_SORTING = [
  {
    id: "lastUpdatedAt",
    desc: true,
  },
];

/**
 * Props for the TokenHoldersTable component
 * @interface TokenHoldersTableProps
 */
interface TokenHoldersTableProps {
  /** The token contract address */
  tokenAddress: string;
  /** The token metadata for formatting */
  token: Token;
}

/**
 * A data table component for displaying token holders
 *
 * This component provides a comprehensive table view of token holders,
 * including their balances, available amounts, frozen amounts, and status.
 *
 * @param {TokenHoldersTableProps} props - The component props
 * @param {string} props.tokenAddress - The address of the token to fetch holders for
 * @param {Token} props.token - The token metadata for display formatting
 * @returns {JSX.Element} A fully-featured data table displaying token holders
 *
 * @example
 * ```tsx
 * <TokenHoldersTable tokenAddress="0x1234...abcd" token={tokenData} />
 * ```
 */
export function TokenHoldersTable({
  tokenAddress,
  token,
}: TokenHoldersTableProps) {
  const router = useRouter();
  const { t } = useTranslation(["tokens", "common"]);
  // Get the current route's path pattern from the matched route
  const routePath =
    router.state.matches[router.state.matches.length - 1]?.pathname;

  const { data: holdersResponse } = useSuspenseQuery({
    ...orpc.token.holders.queryOptions({
      input: {
        tokenAddress,
      },
    }),
  });

  // Extract holders data with proper null checking
  const holders = holdersResponse.token?.balances ?? [];

  /**
   * Creates action items for each row in the table
   *
   * @param {Object} row - The table row object
   * @param {TokenBalance} row.original - The original holder data for the row
   * @returns {ActionItem[]} Array of action items
   */
  const createRowActions = useCallback(
    (row: { original: TokenBalance }): ActionItem[] => [
      {
        label: t("tokens:holders.actions.viewProfile"),
        icon: <UserCircle className="h-4 w-4" />,
        onClick: () => {
          // TODO: Navigate to holder profile
          toast.info("View profile functionality coming soon");
        },
      },
      {
        label: t("tokens:holders.actions.copyAddress"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.id);
          toast.success(t("tokens:holders.actions.addressCopied"));
        },
      },
      {
        label: t("tokens:holders.actions.viewOnEtherscan"),
        icon: <ExternalLink className="h-4 w-4" />,
        href: `https://etherscan.io/address/${row.original.id}`,
        separator: "before",
      },
    ],
    [t]
  );

  /**
   * Handles the freeze bulk action for selected holders
   *
   * @param {TokenBalance[]} selectedHolders - Array of holders selected for freezing
   * @returns {void}
   */
  const handleFreeze = useCallback(
    (selectedHolders: TokenBalance[]) => {
      toast.info(
        t("tokens:holders.bulkActions.freezeMessage", {
          count: selectedHolders.length,
        })
      );
    },
    [t]
  );

  /**
   * Handles the unfreeze bulk action for selected holders
   *
   * @param {TokenBalance[]} selectedHolders - Array of holders selected for unfreezing
   * @returns {void}
   */
  const handleUnfreeze = useCallback(
    (selectedHolders: TokenBalance[]) => {
      toast.info(
        t("tokens:holders.bulkActions.unfreezeMessage", {
          count: selectedHolders.length,
        })
      );
    },
    [t]
  );

  const { actions, actionGroups } = useBulkActions<TokenBalance>({
    onArchive: handleFreeze,
    onDuplicate: handleUnfreeze,
  });

  /**
   * Defines the column configuration for the holders table
   *
   * Includes columns for value, available balance, frozen balance, and frozen status.
   * Uses withAutoFeatures to enhance columns with automatic filtering and sorting capabilities.
   *
   * @returns {ColumnDef<TokenBalance>[]} Array of column definitions for the table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        createSelectionColumn<TokenBalance>(),
        columnHelper.accessor("id", {
          header: t("tokens:holders.columns.address"),
          cell: ({ getValue }) => {
            const address = getValue();
            return (
              <Web3Address
                address={getEthereumAddress(address)}
                copyToClipboard
                size="small"
                showFullAddress={false}
              />
            );
          },
          meta: {
            displayName: t("tokens:holders.columns.address"),
            type: "address",
            icon: User,
          },
        }),
        columnHelper.accessor("value", {
          header: t("tokens:holders.columns.totalBalance"),
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <span className="font-medium">
                {format(value, {
                  compact: true,
                  digits: 2,
                })}{" "}
                {token.symbol}
              </span>
            );
          },
          meta: {
            displayName: t("tokens:holders.columns.totalBalance"),
            type: "number",
            icon: Wallet,
          },
        }),
        columnHelper.accessor("available", {
          header: t("tokens:holders.columns.available"),
          cell: ({ getValue }) => {
            const available = getValue();
            return (
              <span>
                {format(available, {
                  compact: true,
                  digits: 2,
                })}{" "}
                {token.symbol}
              </span>
            );
          },
          meta: {
            displayName: t("tokens:holders.columns.available"),
            type: "number",
            icon: Coins,
          },
        }),
        columnHelper.accessor("frozen", {
          header: t("tokens:holders.columns.frozen"),
          cell: ({ getValue }) => {
            const frozen = getValue();
            return (
              <span className="text-muted-foreground">
                {format(frozen, {
                  compact: true,
                  digits: 2,
                })}{" "}
                {token.symbol}
              </span>
            );
          },
          meta: {
            displayName: t("tokens:holders.columns.frozen"),
            type: "number",
            icon: Lock,
          },
        }),
        columnHelper.accessor("isFrozen", {
          header: t("tokens:holders.columns.status"),
          cell: ({ getValue }) => {
            const isFrozen = getValue();
            return isFrozen ? (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" />
                {t("tokens:holders.status.frozen")}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                {t("tokens:holders.status.active")}
              </Badge>
            );
          },
          meta: {
            displayName: t("tokens:holders.columns.status"),
            type: "option",
            icon: AlertCircle,
            options: [
              {
                value: "true",
                label: t("tokens:holders.status.frozen"),
                icon: CircleX,
              },
              {
                value: "false",
                label: t("tokens:holders.status.active"),
                icon: CircleCheck,
              },
            ],
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("tokens:holders.columns.actions"),
          meta: {
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<TokenBalance>[]),
    [t, token.symbol, createRowActions]
  );

  return (
    <ComponentErrorBoundary componentName="Token Holders Table">
      <DataTable
        name="token-holders"
        data={holders}
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
        advancedToolbar={{
          enableGlobalSearch: false,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("tokens:holders.searchPlaceholder"),
        }}
        bulkActions={{
          enabled: true,
          actions,
          actionGroups,
          position: "bottom",
          showSelectionCount: true,
          enableSelectAll: true,
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={INITIAL_SORTING}
      />
    </ComponentErrorBoundary>
  );
}
