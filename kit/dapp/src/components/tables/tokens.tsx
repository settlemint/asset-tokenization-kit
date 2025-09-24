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
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { from } from "dnum";
import {
  Coins,
  Copy,
  DollarSign,
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

const columnHelper = createStrictColumnHelper<Token>();

/**
 * Initial sorting configuration for the tokens table.
 *
 * Why we sort by creation date (newest first):
 * 1. User Expectation: Most recent tokens are typically most relevant
 * 2. Operational Flow: New token creation is a common workflow
 * 3. Data Freshness: Recently created tokens likely have more complete data
 * 4. Troubleshooting: Newest tokens are often the focus of support queries
 *
 * This default can be overridden by user interaction and is persisted
 * in URL state for consistent experience across sessions.
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
 * A comprehensive data table component for displaying tokenized assets.
 *
 * This component provides a full-featured table view of tokens created by a specific factory,
 * with intelligent price display based on asset classification. Key features include:
 *
 * Price Column Intelligence:
 * - Conditionally displays price data only for financial assets
 * - Uses identity claims to determine when price information is relevant
 * - Gracefully handles missing or incomplete pricing data
 * - Maintains clean UI by hiding irrelevant columns
 *
 * Data Processing:
 * - Fetches tokens with embedded price and classification data
 * - Uses factory-specific filtering for multi-tenant isolation
 * - Handles large datasets through automatic pagination
 * - Provides real-time updates via TanStack Query
 *
 * User Experience Features:
 * - Sortable columns with persistent state
 * - Advanced filtering capabilities
 * - Bulk operations for administrative tasks
 * - Row-level actions (view details, copy address, external links)
 * - Responsive design with column visibility controls
 *
 * Why factory-scoped queries matter:
 * 1. Multi-tenancy: Different organizations use separate factories
 * 2. Performance: Reduces query scope and improves load times
 * 3. Security: Ensures data isolation between different token ecosystems
 * 4. Business Logic: Aligns with the platform's architecture
 *
 * @param {TokensTableProps} props - The component props
 * @param {EthereumAddress} props.factoryAddress - The address of the token factory to fetch tokens from
 * @returns {JSX.Element} A fully-featured data table displaying tokenized assets with intelligent price display
 *
 * @example
 * ```tsx
 * // Basic usage for a specific token factory
 * <TokensTable factoryAddress="0x1234...abcd" />
 *
 * // The component automatically:
 * // - Shows price columns only for financial assets (bonds, equities, etc.)
 * // - Hides price data for utility tokens and governance tokens
 * // - Provides consistent currency formatting across different asset types
 * // - Allows users to show/hide columns based on their needs
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

  // Debug: log a small sample of tokens to verify price/classification presence
  logger.debug("TokensTable fetched tokens", {
    factoryAddress,
    count: tokens.length,
    sample: tokens.slice(0, 5).map((t) => ({
      id: t.id,
      price: t.price,
      assetClassification: t.assetClassification,
    })),
  });
  logger.info("TokensTable fetched tokens sample", {
    factoryAddress,
    count: tokens.length,
    sample: tokens.slice(0, 5).map((t) => ({
      id: t.id,
      price: t.price,
      assetClassification: t.assetClassification,
    })),
  });

  // Note: We now always show the Price column (cells still hide per-row when not applicable)
  const hasAssetClassification = tokens.some((t) => t.assetClassification);

  /**
   * Creates contextual action items for each token row.
   *
   * Why we provide these specific actions:
   * 1. View Details: Primary action for accessing complete token information
   * 2. Copy Address: Essential for blockchain operations and external integrations
   * 3. View on Etherscan: Transparency and verification through external block explorer
   *
   * Design Decisions:
   * - Actions are memoized with useCallback to prevent unnecessary re-renders
   * - Navigation uses the router for proper SPA behavior and route state management
   * - External links open Etherscan for blockchain verification and transparency
   * - Toast notifications provide user feedback for clipboard operations
   *
   * The action menu provides both internal navigation and external verification,
   * supporting both operational workflows and compliance/audit requirements.
   *
   * @param {Object} row - The table row object from react-table
   * @param {Token} row.original - The original token data for the row
   * @returns {ActionItem[]} Array of action items with click handlers and navigation
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
   * Handles the archive bulk action for selected tokens.
   *
   * Why bulk archiving is important:
   * 1. Operational Efficiency: Allows administrators to manage multiple tokens at once
   * 2. Lifecycle Management: Supports token retirement or decommissioning workflows
   * 3. Data Organization: Helps maintain clean active token lists
   * 4. Compliance: May be required for regulatory or business policy reasons
   *
   * Current Implementation Note: This is a placeholder that shows a toast notification.
   * Production implementation would likely call an API endpoint to perform the actual
   * archiving operation, with proper error handling and state updates.
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
   * Handles the duplicate bulk action for selected tokens.
   *
   * Why bulk duplication matters:
   * 1. Template Creation: Allows creating similar tokens based on existing configurations
   * 2. Operational Efficiency: Reduces manual setup for similar asset types
   * 3. Consistency: Ensures similar tokens use proven configurations
   * 4. Rapid Deployment: Supports quick token creation for similar assets
   *
   * Use Cases:
   * - Creating multiple bond series with similar terms
   * - Deploying tokens for different regions with similar configurations
   * - Setting up test environments based on production tokens
   *
   * Current Implementation Note: This is a placeholder that shows a toast notification.
   * Production implementation would navigate to token creation forms with pre-filled data.
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
        columnHelper.display({
          id: "totalSupply",
          header: t("columns.totalSupply"),
          cell: ({ row }) => {
            // Debug: log per-row price context
            logger.debug("TokensTable price cell", {
              tokenId: row.original.id,
              price: row.original.price,
              assetClassification: row.original.assetClassification,
            });
            logger.info("TokensTable price cell", {
              tokenId: row.original.id,
              price: row.original.price,
              assetClassification: row.original.assetClassification,
            });
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
        // Category (from assetClassification) with i18n prettified label
        columnHelper.accessor(
          (row) => {
            const category = row.assetClassification?.category;
            if (!category) return "";
            const scope = row.type === "equity" ? "equity" : "funds";
            const key = `assetClassification.${scope}.categories.${category.toLowerCase()}`;
            const translated = t(key as never);
            return translated || category;
          },
          {
            id: "category",
            header: t("fields.category"),
            meta: {
              displayName: t("fields.category"),
              type: "text",
              emptyValue: "-",
              icon: Type,
            },
          }
        ),
        // Class (from assetClassification) with i18n prettified label
        columnHelper.accessor(
          (row) => {
            const klass = row.assetClassification?.class;
            if (!klass) return "";
            const scope = row.type === "equity" ? "equity" : "funds";
            const key = `assetClassification.${scope}.classes.${klass.toLowerCase()}`;
            const translated = t(key as never);
            return translated || klass;
          },
          {
            id: "class",
            header: t("fields.class"),
            meta: {
              displayName: t("fields.class"),
              type: "text",
              emptyValue: "-",
              icon: Type,
            },
          }
        ),
        /**
         * Price column for financial assets.
         *
         * Why this column is conditionally rendered:
         * 1. User Experience: Price is only meaningful for financial assets (bonds, stocks, etc.)
         * 2. Data Integrity: Prevents confusion by hiding price for utility/governance tokens
         * 3. Business Logic: Price display depends on asset classification from identity claims
         * 4. Performance: Avoids unnecessary formatting for tokens without price data
         *
         * Display Logic Design Decisions:
         * - null return: Completely hides the cell content for non-financial assets
         * - "-" display: Shows placeholder for financial assets without pricing data
         * - formatValue: Uses the standard currency formatter for consistency across the app
         *
         * This approach provides a clean, contextual user interface where price information
         * appears only when relevant and useful to the user.
         */
        columnHelper.display({
          id: "price",
          header: t("columns.price"),
          cell: ({ row }) => {
            /**
             * Guard clause: Only display price for tokens with asset classification.
             *
             * Why we check assetClassification first:
             * 1. Business Rule: Price is only relevant for classified financial assets
             * 2. UI Consistency: Prevents empty cells for utility tokens
             * 3. Data Validation: Ensures we have a valid asset context before showing price
             * 4. Performance: Early return avoids unnecessary price data processing
             *
             * Returning null completely hides the cell content, creating a cleaner
             * table layout where irrelevant data doesn't create visual noise.
             */
            // Show if token has classification OR explicit price present
            const hasPriceContext =
              Boolean(row.original.assetClassification) ||
              Boolean(row.original.price);
            if (hasPriceContext) {
              const price = row.original.price;

              /**
               * Handle missing or incomplete price data gracefully.
               *
               * Why we show "-" instead of null:
               * 1. User Feedback: Indicates that price should exist but isn't available
               * 2. Consistency: Maintains table column alignment and structure
               * 3. Distinction: Different from non-financial assets (which show nothing)
               * 4. Future Data: Placeholder for when pricing becomes available
               *
               * The muted styling indicates incomplete/unavailable data to users.
               */
              if (!price || !price.amount || !price.currencyCode) {
                return <span className="text-muted-foreground">-</span>;
              }

              /**
               * Format and display the price using the standard currency formatter.
               *
               * Why we use formatValue with currency type:
               * 1. Consistency: Same formatting logic used across the entire application
               * 2. Internationalization: Handles different currency codes and locale formatting
               * 3. Precision: Respects the decimals field from price data for proper display
               * 4. Accessibility: Provides proper currency formatting for screen readers
               *
               * The currency.assetSymbol parameter allows formatValue to handle
               * various currencies (USD, EUR, ETH, etc.) with appropriate symbols.
               */
              const decimalsValue =
                typeof price.decimals === "number" ? price.decimals : 2;
              // Always use dnum to preserve precision and scale properly
              const formattedAmount = from([
                BigInt(price.amount),
                decimalsValue,
              ]);

              return formatValue(formattedAmount, {
                type: "currency",
                currency: {
                  assetSymbol: price.currencyCode,
                },
              });
            }
            return null;
          },
          meta: {
            displayName: t("columns.price"),
            type: "none", // No automatic filtering - price display is business-logic driven
            icon: DollarSign,
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("columns.createdAt"),
          meta: {
            displayName: t("columns.createdAt"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          meta: {
            type: "none",
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<Token>[]),
    [t, createRowActions]
  );

  /**
   * Handles row click events to navigate to token details page.
   *
   * Why we enable row-level navigation:
   * 1. User Experience: Intuitive interaction pattern for drilling into details
   * 2. Efficiency: Provides quick access without requiring action menu clicks
   * 3. Mobile Friendly: Touch-friendly interaction for tablet and mobile users
   * 4. Accessibility: Keyboard navigation support for screen readers
   *
   * Navigation Strategy:
   * - Uses TanStack Router for proper SPA routing and state management
   * - Maintains URL structure that supports bookmarking and sharing
   * - Gracefully handles navigation errors without crashing the table
   * - Preserves table state when users navigate back
   *
   * The factory address is included in the route to maintain context
   * and ensure proper data scoping for the detail view.
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
        /**
         * Dynamic column visibility configuration.
         *
         * Why columns are shown/hidden:
         * 1. name: Usually redundant with symbol, saves horizontal space
         * 2. createdAt: Detailed timestamp less important for overview tables
         * 3. price: Automatically shown when tokens have asset classification claims
         *
         * Design Philosophy:
         * - Automatically surface relevant information based on data context
         * - Price column appears when financial assets are present
         * - Users can still manually control visibility via column options
         * - Reduces cognitive load while maintaining contextual relevance
         *
         * Dynamic Behavior:
         * - price: Shown when any token has asset classification claims
         * - This ensures financial data is visible when relevant without manual configuration
         */
        initialColumnVisibility={{
          name: false, // Symbol is usually sufficient for token identification
          createdAt: false, // Detailed timestamp less critical for overview
          price: true, // Always show price column; row cells decide visibility
          category: hasAssetClassification, // Show when classification exists
          class: hasAssetClassification, // Show when classification exists
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
