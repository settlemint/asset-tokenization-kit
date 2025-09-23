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
import { BurnSheet } from "@/components/manage-dropdown/sheets/burn-sheet";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { AssetBalance } from "@atk/zod/asset-balance";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { Dnum } from "dnum";
import {
  AlertCircle,
  Calendar,
  CircleCheck,
  CircleX,
  Coins,
  Copy,
  ExternalLink,
  Flame,
  Lock,
  User,
  UserCircle,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const columnHelper = createStrictColumnHelper<AssetBalance>();

/**
 * Default sorting configuration prioritizes most recently active holders.
 *
 * We sort by lastUpdatedAt descending to show holders with recent token activity first,
 * which is more relevant for compliance monitoring and operational insights than
 * alphabetical or balance-based sorting. This helps administrators quickly identify
 * active participants in the token ecosystem.
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
 * @param {Token} props.token - The token metadata for display formatting
 * @returns {JSX.Element} A fully-featured data table displaying token holders
 *
 * @example
 * ```tsx
 * <TokenHoldersTable tokenAddress="0x1234...abcd" token={tokenData} />
 * ```
 */
export function TokenHoldersTable({ token }: TokenHoldersTableProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const router = useRouter();
  const routePath = router.state.matches.at(-1)?.pathname;

  const { data: holdersResponse } = useSuspenseQuery(
    orpc.token.holders.queryOptions({
      input: {
        tokenAddress: token.id,
      },
    })
  );

  // Extract holders data with defensive null checking to prevent runtime errors
  // The API may return partial data during loading states or network issues
  const holders = holdersResponse.token?.balances ?? [];

  // Token state determines available actions for security and compliance
  const isPaused = token.pausable?.paused ?? false;
  // Burn operations require explicit permission AND token must not be paused
  // This dual-check prevents unauthorized token destruction and operations during emergency pauses
  const canBurn = (token.userPermissions?.actions?.burn ?? false) && !isPaused;

  // Burn target state manages the modal for burning tokens from specific holders
  // Stores both address and available balance to pre-populate the burn form
  const [burnTarget, setBurnTarget] = useState<{
    address: `0x${string}`;
    available?: Dnum;
  } | null>(null);

  /**
   * Generates contextual actions for each holder row based on permissions and state.
   *
   * Action availability is determined by:
   * - User permissions (burn capability)
   * - Token state (paused/active)
   * - Holder balance (must have available tokens to burn)
   *
   * This approach ensures users only see actionable options, reducing confusion
   * and preventing invalid operations that would fail.
   *
   * @param {Object} row - The table row object
   * @param {AssetBalance} row.original - The original holder data for the row
   * @returns {ActionItem[]} Array of contextually appropriate action items
   */
  const createRowActions = useCallback(
    (row: { original: AssetBalance }): ActionItem[] => [
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
          void navigator.clipboard.writeText(row.original.account.id);
          toast.success(t("tokens:holders.actions.addressCopied"));
        },
      },
      // Burn action only appears when user has permission, token isn't paused,
      // and holder has available (non-frozen) tokens to burn
      // This prevents UI clutter and invalid burn attempts
      ...(canBurn && row.original.available[0] > 0n
        ? [
            {
              label: t("tokens:holders.actions.burn"),
              icon: <Flame className="h-4 w-4" />,
              onClick: () => {
                setBurnTarget({
                  address: row.original.account.id,
                  available: row.original.available,
                });
              },
            } satisfies ActionItem,
          ]
        : []),
      {
        label: t("tokens:holders.actions.viewOnEtherscan"),
        icon: <ExternalLink className="h-4 w-4" />,
        href: `https://etherscan.io/address/${row.original.account.id}`,
        separator: "before",
      },
    ],
    [t, canBurn]
  );

  /**
   * Handles bulk freeze operations for compliance and risk management.
   *
   * Freezing multiple accounts simultaneously is essential for:
   * - Emergency response to security incidents
   * - Compliance enforcement across related accounts
   * - Batch processing of regulatory actions
   *
   * Currently shows notification for demo purposes; production would
   * integrate with smart contract freeze functions.
   *
   * @param {AssetBalance[]} selectedHolders - Array of holders selected for freezing
   * @returns {void}
   */
  const handleFreeze = useCallback(
    (selectedHolders: AssetBalance[]) => {
      toast.info(
        t("tokens:holders.bulkActions.freezeMessage", {
          count: selectedHolders.length,
        })
      );
    },
    [t]
  );

  /**
   * Handles bulk unfreeze operations for account restoration.
   *
   * Bulk unfreezing allows efficient restoration of accounts after:
   * - Resolution of compliance issues
   * - Completion of investigation processes
   * - Lifting of temporary restrictions
   *
   * Batch operations reduce administrative overhead and ensure
   * consistent timing across related accounts.
   *
   * @param {AssetBalance[]} selectedHolders - Array of holders selected for unfreezing
   * @returns {void}
   */
  const handleUnfreeze = useCallback(
    (selectedHolders: AssetBalance[]) => {
      toast.info(
        t("tokens:holders.bulkActions.unfreezeMessage", {
          count: selectedHolders.length,
        })
      );
    },
    [t]
  );

  // Map generic bulk action handlers to domain-specific freeze operations
  // Using onArchive for freeze and onDuplicate for unfreeze leverages existing
  // bulk action infrastructure while maintaining semantic clarity
  const { actions, actionGroups } = useBulkActions<AssetBalance>({
    onArchive: handleFreeze,
    onDuplicate: handleUnfreeze,
  });

  /**
   * Column definitions optimized for token compliance and operational monitoring.
   *
   * Column order prioritizes:
   * 1. Identity (address) - Primary identifier for compliance tracking
   * 2. Financial data (balances) - Core operational metrics
   * 3. Temporal data (last activity) - Risk and compliance indicators
   * 4. Status - Immediate visual compliance state
   * 5. Actions - Context-sensitive operations
   *
   * withAutoFeatures adds intelligent filtering, sorting, and export capabilities
   * without manual configuration, reducing maintenance overhead.
   *
   * @returns {ColumnDef<AssetBalance>[]} Fully configured column definitions
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        createSelectionColumn<AssetBalance>(),
        columnHelper.accessor("account.id", {
          header: t("tokens:holders.columns.address"),
          meta: {
            displayName: t("tokens:holders.columns.address"),
            type: "address",
            icon: User,
          },
        }),
        columnHelper.accessor("value", {
          header: t("tokens:holders.columns.totalBalance"),
          meta: {
            displayName: t("tokens:holders.columns.totalBalance"),
            type: "currency",
            icon: Wallet,
            currency: { assetSymbol: token.symbol },
          },
        }),
        columnHelper.accessor("available", {
          header: t("tokens:holders.columns.available"),
          meta: {
            displayName: t("tokens:holders.columns.available"),
            type: "currency",
            icon: Coins,
            currency: { assetSymbol: token.symbol },
          },
        }),
        columnHelper.accessor("frozen", {
          header: t("tokens:holders.columns.frozen"),
          meta: {
            displayName: t("tokens:holders.columns.frozen"),
            type: "currency",
            currency: { assetSymbol: token.symbol },
            icon: Lock,
          },
        }),
        columnHelper.accessor("lastUpdatedAt", {
          header: t("tokens:holders.columns.lastActivity"),
          meta: {
            displayName: t("tokens:holders.columns.lastActivity"),
            type: "date",
            icon: Calendar,
          },
          // Last Activity tracks when a holder's balance was last modified
          // Critical for compliance reporting and detecting dormant accounts
          // Helps identify accounts that may need KYC renewal or compliance review
        }),
        /**
         * Status column displays frozen state with visual badges.
         *
         * Using display column instead of accessor because isFrozen is computed
         * from the frozen balance amount, not a direct field. The badge design
         * provides immediate visual feedback for compliance officers reviewing
         * account restrictions.
         */
        columnHelper.display({
          id: "isFrozen",
          header: t("tokens:holders.columns.status"),
          cell: ({ row }) => {
            const isFrozen = row.original.isFrozen;
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
            type: "none",
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<AssetBalance>[]),
    [t, token.symbol, createRowActions]
  );

  return (
    <ComponentErrorBoundary componentName="Token Holders Table">
      {canBurn && (
        <BurnSheet
          open={!!burnTarget}
          onOpenChange={(open) => {
            if (!open) setBurnTarget(null);
          }}
          asset={token}
          preset={
            burnTarget
              ? { address: burnTarget.address, available: burnTarget.available }
              : undefined
          }
        />
      )}
      <div className="space-y-4">
        {/* 
          Total holders display provides immediate context for token distribution.
          
          Showing holder count upfront helps users understand the scale of token
          distribution before diving into individual records. This is particularly
          important for compliance reporting where holder count thresholds may
          trigger regulatory requirements (e.g., SEC filing requirements).
        */}
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">
            {t("tokens:holders.totalHolders", { count: holders.length })}
          </p>
        </div>
        <DataTable
          name="token-holders"
          data={holders}
          columns={columns}
          urlState={{
            enabled: true,
            routePath,
            enableUrlPersistence: true,
            // Page size of 20 balances performance with usability
            // Large holder lists can impact rendering performance, while too small
            // a page size creates excessive pagination for operational use
            defaultPageSize: 20,
            enableGlobalFilter: true,
            enableRowSelection: true,
            // 300ms debounce reduces API calls during rapid typing
            // Critical for holder searches which may query large datasets
            debounceMs: 300,
          }}
          advancedToolbar={{
            // Global search disabled in favor of column-specific filters
            // Holder data benefits from precise filtering (by balance range, status)
            // rather than broad text search across all fields
            enableGlobalSearch: false,
            enableFilters: true,
            // Export enables compliance reporting and backup procedures
            enableExport: true,
            enableViewOptions: true,
            placeholder: t("tokens:holders.searchPlaceholder"),
          }}
          bulkActions={{
            enabled: true,
            actions,
            actionGroups,
            // Bottom position keeps actions visible during long scrolling sessions
            // Important for administrators processing large holder lists
            position: "bottom",
            showSelectionCount: true,
            // Select all enabled for batch compliance operations
            // Allows efficient freeze/unfreeze of multiple accounts
            enableSelectAll: true,
          }}
          pagination={{
            // Pagination essential for large holder lists to maintain performance
            // Token holder lists can grow to thousands of entries
            enablePagination: true,
          }}
          initialSorting={INITIAL_SORTING}
        />
      </div>
    </ComponentErrorBoundary>
  );
}
