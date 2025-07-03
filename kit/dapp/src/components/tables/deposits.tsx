import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import {
  ActionsCell,
  type ActionItem,
} from "@/components/data-table/cells/actions-cell";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  Package,
  Plus,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/components/data-table/filters/types/table-extensions";

/**
 * Represents a single token from the TokenList
 * @typedef {TokenList[number]} Token
 */
type Token = TokenList[number];

const columnHelper = createColumnHelper<Token>();

/**
 * Initial sorting configuration for the deposits table
 * Sorts tokens by name in ascending order by default
 */
const INITIAL_SORTING = [
  {
    id: "name",
    desc: false,
  },
];

/**
 * Props for the DepositsTable component
 * @interface DepositsTableProps
 */
interface DepositsTableProps {
  /** The address of the token factory contract */
  factoryAddress: string;
}

/**
 * A data table component for displaying deposit tokens
 *
 * This component provides a comprehensive table view of tokens created by a specific factory,
 * including features like sorting, filtering, pagination, bulk actions, and row actions.
 *
 * @param {DepositsTableProps} props - The component props
 * @param {string} props.factoryAddress - The address of the token factory to fetch tokens from
 * @returns {JSX.Element} A fully-featured data table displaying deposit tokens
 *
 * @example
 * ```tsx
 * <DepositsTable factoryAddress="0x1234...abcd" />
 * ```
 */
export function DepositsTable({ factoryAddress }: DepositsTableProps) {
  const router = useRouter();
  const { t } = useTranslation("general");
  // Get the current route's path pattern from the matched route
  const routePath =
    router.state.matches[router.state.matches.length - 1]?.pathname;

  const { data: tokensResponse } = useQuery({
    ...orpc.token.list.queryOptions({
      input: {
        tokenFactory: factoryAddress,
      },
    }),
  });

  const tokens = tokensResponse ?? [];

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
        label: t("components.deposits-table.actions.view-details"),
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
        label: t("components.deposits-table.actions.copy-address"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.id);
          toast.success(t("components.deposits-table.actions.address-copied"));
        },
      },
      {
        label: t("components.deposits-table.actions.view-on-etherscan"),
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
        t("components.deposits-table.bulk-actions.archive-message", {
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
        t("components.deposits-table.bulk-actions.duplicate-message", {
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

  const customActions = useMemo(
    () => (
      <Button variant="default" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        {t("components.deposits-table.actions.create-token")}
      </Button>
    ),
    [t]
  );

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
        columnHelper.accessor("name", {
          header: t("components.deposits-table.columns.name"),
          meta: {
            displayName: t("components.deposits-table.columns.token-name"),
            type: "text",
            icon: Type,
          },
        }),
        columnHelper.accessor("symbol", {
          header: t("components.deposits-table.columns.symbol"),
          meta: {
            displayName: t("components.deposits-table.columns.token-symbol"),
            type: "badge",
            icon: Coins,
          },
        }),
        columnHelper.accessor("decimals", {
          header: t("components.deposits-table.columns.decimals"),
          meta: {
            displayName: t("components.deposits-table.columns.decimals"),
            type: "number",
            icon: Hash,
            max: 18,
          },
        }),
        columnHelper.accessor("id", {
          header: t("components.deposits-table.columns.contract-address"),
          meta: {
            displayName: t(
              "components.deposits-table.columns.contract-address"
            ),
            type: "address",
            icon: Copy,
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("components.deposits-table.columns.actions"),
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
      void router.navigate({
        to: "/token/$factoryAddress/$tokenAddress",
        params: {
          factoryAddress,
          tokenAddress: token.id,
        },
      });
    },
    [router, factoryAddress]
  );

  return (
    <DataTable
      name="tokens"
      data={tokens}
      columns={useCallback(() => columns, [columns])}
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
        placeholder: t("components.deposits-table.search-placeholder"),
        customActions,
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
        title: t("components.deposits-table.empty-state.title"),
        description: t("components.deposits-table.empty-state.description"),
        icon: Package,
      }}
      onRowClick={handleRowClick}
    />
  );
}
