import {
  type ActionItem,
  ActionsCell,
} from "@/components/data-table/cells/actions-cell";
import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Web3Address } from "@/components/web3/web3-address";
import { Web3TransactionHash } from "@/components/web3/web3-transaction-hash";
import { formatEventName } from "@/lib/utils/format-event-name";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import type { Event as TokenEvent } from "@/orpc/routes/token/routes/token.events.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import {
  getEthereumAddress,
  isEthereumAddress,
} from "@atk/zod/ethereum-address";
import { isEthereumHash } from "@atk/zod/ethereum-hash";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Copy,
  ExternalLink,
  Hash,
  Info,
  Send,
  Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const columnHelper = createStrictColumnHelper<TokenEvent>();

/**
 * Initial sorting configuration for the events table
 * Sorts events by blockTimestamp in descending order by default
 */
const INITIAL_SORTING = [
  {
    id: "blockTimestamp",
    desc: true,
  },
  {
    id: "txIndex",
    desc: true,
  },
];

/**
 * Props for the TokenEventsTable component
 * @interface TokenEventsTableProps
 */
interface TokenEventsTableProps {
  /** The token metadata for display */
  token: Token;
}

/**
 * Component to display event details in a sheet
 */
function EventDetailsSheet({
  event,
  token,
  open,
  onOpenChange,
}: {
  event: TokenEvent;
  token: Token;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  "use no memo";
  const { t } = useTranslation(["tokens", "common"]);

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="min-w-[34rem]"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <SheetHeader>
          <SheetTitle>{formatEventName(event.eventName)}</SheetTitle>
        </SheetHeader>

        <div className="mx-4 mt-4 overflow-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("tokens:events.details.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <dt className="text-muted-foreground text-sm">
                  {t("tokens:events.details.sender")}:
                </dt>
                <dd className="text-sm">
                  <Web3Address
                    address={getEthereumAddress(event.sender.id)}
                    size="tiny"
                  />
                </dd>

                <dt className="text-muted-foreground text-sm">
                  {t("tokens:events.details.asset")}:
                </dt>
                <dd className="text-sm">
                  <Web3Address address={token.id} size="tiny" />
                </dd>

                <dt className="text-muted-foreground text-sm">
                  {t("tokens:events.details.timestamp")}:
                </dt>
                <dd className="text-sm">
                  {formatValue(event.blockTimestamp, {
                    type: "date",
                  })}
                </dd>

                <dt className="text-muted-foreground text-sm">
                  {t("tokens:events.details.transactionHash")}:
                </dt>
                <dd className="text-sm">
                  <Web3TransactionHash
                    hash={event.transactionHash}
                    copyToClipboard
                    showFullHash={false}
                  />
                </dd>
              </dl>
            </CardContent>
          </Card>

          {event.values &&
            event.values.length > 0 &&
            (() => {
              const filteredValues = event.values.filter(
                (value) => value.name.toLowerCase() !== "sender"
              );

              if (filteredValues.length === 0) {
                return null;
              }

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("tokens:events.details.eventParameters")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-[1fr_2fr] gap-4">
                      {filteredValues.map((value) => {
                        // Determine type and format value using zod validators
                        let formattedValue: React.ReactNode = value.value;

                        // Use zod validators to determine type
                        if (isEthereumAddress(value.value)) {
                          formattedValue = formatValue(value.value, {
                            type: "address",
                          });
                        } else if (isEthereumHash(value.value)) {
                          // Display transaction hashes in monospace font with truncation
                          formattedValue = (
                            <Web3TransactionHash
                              hash={value.value}
                              copyToClipboard
                              showFullHash={false}
                            />
                          );
                        } else if (
                          typeof value.value === "string" &&
                          value.value.trim() !== "" &&
                          !Number.isNaN(Number(value.value.trim()))
                        ) {
                          formattedValue = formatValue(value.value, {
                            type: "number",
                          });
                        } else {
                          // For any other value, display as text
                          formattedValue = value.value ?? "";
                        }

                        return (
                          <React.Fragment key={value.id}>
                            <dt className="text-muted-foreground text-sm">
                              {formatEventName(value.name)}:
                            </dt>
                            <dd className="text-sm break-all">
                              {formattedValue}
                            </dd>
                          </React.Fragment>
                        );
                      })}
                    </dl>
                  </CardContent>
                </Card>
              );
            })()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * A data table component for displaying token events
 *
 * This component provides a comprehensive table view of token events,
 * including event names, timestamps, senders, and transaction details.
 *
 * @param {TokenEventsTableProps} props - The component props
 * @param {Token} props.token - The token metadata for display
 * @returns {JSX.Element} A fully-featured data table displaying token events
 *
 * @example
 * ```tsx
 * <TokenEventsTable token={tokenData} />
 * ```
 */
export const TokenEventsTable = withErrorBoundary(function TokenEventsTable({
  token,
}: TokenEventsTableProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const [selectedEvent, setSelectedEvent] = useState<TokenEvent | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const routePath = router.state.matches.at(-1)?.pathname;

  const { data: eventsResponse } = useSuspenseQuery(
    orpc.token.events.queryOptions({
      input: {
        tokenAddress: token.id,
      },
    })
  );

  // Extract events data
  const events = eventsResponse.events;

  /**
   * Handle row click to open event details
   */
  const handleRowClick = useCallback((row: TokenEvent) => {
    setSelectedEvent(row);
    setIsSheetOpen(true);
  }, []);

  /**
   * Creates action items for each row in the table
   *
   * @param {Object} row - The table row object
   * @param {TokenEvent} row.original - The original event data for the row
   * @returns {ActionItem[]} Array of action items
   */
  const createRowActions = useCallback(
    (row: { original: TokenEvent }): ActionItem[] => [
      {
        label: t("tokens:events.actions.viewDetails"),
        icon: <Info className="h-4 w-4" />,
        onClick: () => {
          setSelectedEvent(row.original);
          setIsSheetOpen(true);
        },
      },
      {
        label: t("tokens:events.actions.copyTransactionHash"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.transactionHash);
          toast.success(t("tokens:events.actions.transactionHashCopied"));
        },
        separator: "before",
      },
      {
        label: t("tokens:events.actions.viewOnEtherscan"),
        icon: <ExternalLink className="h-4 w-4" />,
        href: `https://etherscan.io/tx/${row.original.transactionHash}`,
      },
    ],
    [t]
  );

  /**
   * Defines the column configuration for the events table
   *
   * Includes columns for timestamp, event name, sender, and actions.
   * Uses withAutoFeatures to enhance columns with automatic filtering and sorting capabilities.
   *
   * @returns {ColumnDef<TokenEvent>[]} Array of column definitions for the table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        createSelectionColumn<TokenEvent>(),
        columnHelper.accessor("blockTimestamp", {
          header: t("tokens:events.columns.timestamp"),
          meta: {
            displayName: t("tokens:events.columns.timestamp"),
            type: "date",
            icon: Calendar,
          },
        }),
        columnHelper.accessor("txIndex", {
          header: t("tokens:events.columns.txIndex"),
          meta: {
            displayName: t("tokens:events.columns.txIndex"),
            type: "number",
            icon: Hash,
          },
        }),
        columnHelper.accessor((row) => formatEventName(row.eventName), {
          header: t("tokens:events.columns.event"),
          meta: {
            displayName: t("tokens:events.columns.event"),
            type: "text",
            icon: Zap,
          },
        }),
        columnHelper.accessor((row) => row.sender.id, {
          id: "sender",
          header: t("tokens:events.columns.sender"),
          meta: {
            displayName: t("tokens:events.columns.sender"),
            type: "address",
            icon: Send,
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
          meta: {
            type: "none",
            enableCsvExport: false,
          },
          enableSorting: false,
          enableHiding: false,
        }),
      ] as ColumnDef<TokenEvent>[]),
    [t, createRowActions]
  );

  return (
    <>
      <DataTable
        name="token-events"
        data={events}
        columns={columns}
        urlState={{
          routePath,
          enabled: true,
          enableUrlPersistence: true,
          defaultPageSize: 20,
          enableGlobalFilter: true,
          enableRowSelection: true,
          debounceMs: 300,
        }}
        initialColumnVisibility={{
          txIndex: false,
        }}
        advancedToolbar={{
          enableGlobalSearch: false,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("tokens:events.searchPlaceholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={INITIAL_SORTING}
        onRowClick={handleRowClick}
      />
      {selectedEvent && (
        <EventDetailsSheet
          event={selectedEvent}
          token={token}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </>
  );
});
