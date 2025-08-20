import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { formatDate } from "@/lib/utils/date";
import { orpc } from "@/orpc/orpc-client";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "dnum";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  Package,
  PauseCircle,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

/**
 * Represents a single token from the TokenList
 * @typedef {TokenList[number]} Token
 */
type Token = TokenList[number];

const columnHelper = createColumnHelper<Token>();

/**
 * Initial sorting configuration for the deposits table
 * Sorts tokens by creation date in descending order by default (most recent first)
 */
const INITIAL_SORTING = [
  {
    id: "createdAt",
    desc: true,
  },
];

/**
 * Props for the TokensTable component
 * @interface TokensTableProps
 */
interface TokensTableProps {
  /** The address of the token factory contract */
  factoryAddress: EthereumAddress;
}

/**
 * A data table component for displaying deposit tokens
 *
 * This component provides a comprehensive table view of tokens created by a specific factory,
 * including features like sorting, filtering, pagination, bulk actions, and row actions.
 *
 * @param {TokensTableProps} props - The component props
 * @param {string} props.factoryAddress - The address of the token factory to fetch tokens from
 * @returns {JSX.Element} A fully-featured data table displaying deposit tokens
 *
 * @example
 * ```tsx
 * <TokensTable factoryAddress="0x1234...abcd" />
 * ```
 */
export function TokensTable({ factoryAddress }: TokensTableProps) {
  const router = useRouter();
  const { t } = useTranslation("tokens");
  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;

  const { data: tokens } = useSuspenseQuery(
    orpc.token.list.queryOptions({
      input: {
        tokenFactory: factoryAddress,
      },
    })
  );

  /**
   * Creates action items for each row in the table
   *
   * @param {Object} row - The table row object
   * @param {Token} row.original - The original token data for the row
   * @returns {ActionItem[]} Array of action items including view details, copy address, and view on etherscan
   */
  const createRowActions = useCallback(
    (row: { original: Token }): ActionItem[] => [
      {
        label: t("actions.viewDetails"),
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          logger.debug("View details onClick triggered");
          logger.debug("Navigating to:", {
            to: "/token/$factoryAddress/$tokenAddress",
            params: {
              factoryAddress,
              tokenAddress: row.original.id,
            },
          });
          void (async () => {
            try {
              await router.navigate({
                to: "/token/$factoryAddress/$tokenAddress",
                params: {
                  factoryAddress,
                  tokenAddress: row.original.id,
                },
              });
              logger.debug("Navigation completed");
            } catch (error) {
              logger.error("Navigation failed:", error);
            }
          })();
        },
      },
      {
        label: t("actions.copyAddress"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.id);
          toast.success(t("actions.addressCopied"));
        },
      },
      {
        label: t("actions.viewOnEtherscan"),
        icon: <ExternalLink className="h-4 w-4" />,
        href: `https://etherscan.io/token/${row.original.id}`,
        separator: "before",
      },
    ],
    [t, router, factoryAddress]
  );

  /**
   * Handles the archive bulk action for selected tokens
   *
   * @param {Token[]} selectedTokens - Array of tokens selected for archiving
   * @returns {void}
   */
  const handleArchive = useCallback(
    (selectedTokens: Token[]) => {
      toast.info(
        t("bulkActions.archiveMessage", {
          count: selectedTokens.length,
        })
      );
    },
    [t]
  );

  /**
   * Handles the duplicate bulk action for selected tokens
   *
   * @param {Token[]} selectedTokens - Array of tokens selected for duplication
   * @returns {void}
   */
  const handleDuplicate = useCallback(
    (selectedTokens: Token[]) => {
      toast.info(
        t("bulkActions.duplicateMessage", {
          count: selectedTokens.length,
        })
      );
    },
    [t]
  );

  const { actions, actionGroups } = useBulkActions<Token>({
    onArchive: handleArchive,
    onDuplicate: handleDuplicate,
  });

  /**
   * Defines the column configuration for the deposits table
   *
   * Includes columns for selection, name, symbol, decimals, contract address, and actions.
   * Uses withAutoFeatures to enhance columns with automatic filtering and sorting capabilities.
   *
   * @returns {ColumnDef<Token>[]} Array of column definitions for the table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        createSelectionColumn<Token>(),
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
        columnHelper.accessor("totalSupply", {
          header: t("columns.totalSupply"),
          cell: (cellProps) => {
            return format(cellProps.getValue());
          },
          meta: {
            displayName: t("columns.totalSupply"),
            type: "number",
            icon: Coins,
          },
        }),
        columnHelper.accessor("pausable.paused", {
          header: t("columns.paused"),
          cell: (cellProps) => {
            const paused = cellProps.getValue();
            return <TokenStatusBadge paused={paused} />;
          },
          meta: {
            displayName: t("columns.paused"),
            type: "badge",
            icon: PauseCircle,
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("columns.createdAt"),
          cell: (cellProps) => {
            const timestamp = cellProps.getValue();
            return formatDate(timestamp);
          },
          meta: {
            displayName: t("columns.createdAt"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          meta: {
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<Token>[]),
    [t, createRowActions]
  );

  /**
   * Handles row click events to navigate to token details page
   *
   * @param {Token} token - The token object from the clicked row
   * @returns {void}
   */
  const handleRowClick = useCallback(
    (token: Token) => {
      void (async () => {
        try {
          await router.navigate({
            to: "/token/$factoryAddress/$tokenAddress",
            params: {
              factoryAddress,
              tokenAddress: token.id,
            },
          });
        } catch {
          // ignore
        }
      })();
    },
    [router, factoryAddress]
  );

  return (
    <ComponentErrorBoundary componentName="Tokens Table">
      <DataTable
        name="tokens"
        data={tokens}
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
          createdAt: false,
        }}
        advancedToolbar={{
          enableGlobalSearch: false,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("searchPlaceholder"),
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
        customEmptyState={{
          title: t("emptyState.title"),
          description: t("emptyState.description"),
          icon: Package,
        }}
        onRowClick={handleRowClick}
      />
    </ComponentErrorBoundary>
  );
}
