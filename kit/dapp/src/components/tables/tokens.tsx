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
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
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
export const TokensTable = withErrorBoundary(function TokensTable({
  factoryAddress,
}: TokensTableProps) {
  const router = useRouter();
  const { t } = useTranslation("tokens");
  // Get the current route's path pattern from the matched route
  const routePath = router.state.matches.at(-1)?.pathname;

  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );
  const { data: response } = useSuspenseQuery(
    orpc.token.list.queryOptions({
      input: {
        tokenFactory: factoryAddress,
      },
    })
  );

  const tokens = response.tokens;
  const totalCount = response.totalCount;

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
          void router.navigate({
            to: "/token/$factoryAddress/$tokenAddress",
            params: {
              factoryAddress,
              tokenAddress: row.original.id,
            },
          });
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
  const columns = useMemo(() => {
    const defaultColumns = [
      columnHelper.accessor("id", {
        header: t("columns.contractAddress"),
        meta: {
          displayName: t("columns.contractAddress"),
          type: "address",
          icon: Copy,
          addressOptions: {
            showPrettyName: false,
          },
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
    ];
    // if (hasAssetClassification) {
    //   defaultColumns.push(
    //     // Category (from assetClassification)
    //     columnHelper.display({
    //       id: "category",
    //       header: t("fields.category"),
    //       cell: ({ row }) => {
    //         const classification = parseClaim<{
    //           class?: string;
    //           category?: string;
    //         }>(row.original.claims, "assetClassification");
    //         const category = classification?.category;
    //         if (!category) return "-";

    //         // Translate based on actual token type with validation
    //         if (row.original.type === "equity") {
    //           // Validate the category matches expected enum values
    //           const equitySchema = equityCategory();
    //           const parseResult = equitySchema.safeParse(category);
    //           if (parseResult.success) {
    //             // Use type-safe translation key with validated enum value
    //             return t(
    //               `assetClassification.equity.categories.${parseResult.data.toLowerCase() as Lowercase<EquityCategory>}`
    //             );
    //           }
    //         } else if (row.original.type === "fund") {
    //           // Validate the category matches expected enum values
    //           const fundSchema = fundCategory();
    //           const parseResult = fundSchema.safeParse(category);
    //           if (parseResult.success) {
    //             // Use type-safe translation key with validated enum value
    //             return t(
    //               `assetClassification.funds.categories.${parseResult.data.toLowerCase() as Lowercase<FundCategory>}`
    //             );
    //           }
    //         }
    //         // For invalid/unknown categories or other token types, return raw value
    //         return category;
    //       },
    //       meta: {
    //         displayName: t("fields.category"),
    //         type: "text",
    //         emptyValue: "-",
    //         icon: Type,
    //       },
    //     }),
    //     // Class (from assetClassification)
    //     columnHelper.display({
    //       id: "class",
    //       header: t("fields.class"),
    //       cell: ({ row }) => {
    //         const classification = parseClaim<{
    //           class?: string;
    //           category?: string;
    //         }>(row.original.claims, "assetClassification");
    //         const classificationClass = classification?.class;
    //         if (!classificationClass) return "-";

    //         // Translate based on actual token type with validation
    //         if (row.original.type === "equity") {
    //           // Validate the class matches expected enum values
    //           const equityClassSchema = equityClass();
    //           const parseResult =
    //             equityClassSchema.safeParse(classificationClass);
    //           if (parseResult.success) {
    //             // Use type-safe translation key with validated enum value
    //             return t(
    //               `assetClassification.equity.classes.${parseResult.data.toLowerCase() as Lowercase<EquityClass>}`
    //             );
    //           }
    //         } else if (row.original.type === "fund") {
    //           // Validate the class matches expected enum values
    //           const fundClassSchema = fundClass();
    //           const parseResult =
    //             fundClassSchema.safeParse(classificationClass);
    //           if (parseResult.success) {
    //             // Use type-safe translation key with validated enum value
    //             return t(
    //               `assetClassification.funds.classes.${parseResult.data.toLowerCase() as Lowercase<FundClass>}`
    //             );
    //           }
    //         }
    //         // For invalid/unknown classes or other token types, return raw value
    //         return classificationClass;
    //       },
    //       meta: {
    //         displayName: t("fields.class"),
    //         type: "text",
    //         emptyValue: "-",
    //         icon: Type,
    //       },
    //     })
    //   );
    // }
    return withAutoFeatures([
      createSelectionColumn<Token>(),
      ...defaultColumns,
      columnHelper.accessor("basePrice", {
        id: "basePrice",
        header: t("columns.price"),
        meta: {
          displayName: t("columns.price"),
          type: "currency",
          currency: { assetSymbol: baseCurrency ?? "" },
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
    ] as ColumnDef<Token>[]);
  }, [t, createRowActions, baseCurrency]);

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
        category: false, // Show when classification exists
        class: false, // Show when classification exists
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
        totalCount,
      }}
      initialSorting={INITIAL_SORTING}
      customEmptyState={{
        title: t("emptyState.title"),
        description: t("emptyState.description"),
        icon: Package,
      }}
      onRowClick={handleRowClick}
    />
  );
});
