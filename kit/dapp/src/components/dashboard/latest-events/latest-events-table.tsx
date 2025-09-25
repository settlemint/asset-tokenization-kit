import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Web3TransactionHash } from "@/components/web3/web3-transaction-hash";
import { formatEventName } from "@/lib/utils/format-event-name";
import type { UserEvent } from "@/orpc/routes/user/routes/user.events.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, ExternalLink, History, Zap } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const columnHelper = createStrictColumnHelper<UserEvent>();

const INITIAL_SORTING = [
  { id: "blockTimestamp", desc: true },
  { id: "txIndex", desc: true },
];

const EXPLORER_BASE_URL = "https://etherscan.io";

interface LatestEventsTableProps {
  events: UserEvent[];
}

export function LatestEventsTable({ events }: LatestEventsTableProps) {
  const { t } = useTranslation("dashboard");

  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "eventName",
          header: t("widgets.latestEvents.columns.event"),
          cell: ({ row }) => (
            <span className="text-sm font-medium">
              {t(`widgets.latestEvents.types.${row.original.eventName}`, {
                defaultValue: formatEventName(row.original.eventName),
              })}
            </span>
          ),
          meta: {
            displayName: t("widgets.latestEvents.columns.event"),
            type: "text",
            icon: Zap,
          },
        }),
        columnHelper.accessor((row) => row.emitter.id, {
          id: "emitter",
          header: t("widgets.latestEvents.columns.asset"),
          meta: {
            displayName: t("widgets.latestEvents.columns.asset"),
            type: "address",
          },
        }),
        columnHelper.accessor((row) => row.sender.id, {
          id: "account",
          header: t("widgets.latestEvents.columns.account"),
          meta: {
            displayName: t("widgets.latestEvents.columns.account"),
            type: "address",
          },
        }),
        columnHelper.accessor("blockTimestamp", {
          header: t("widgets.latestEvents.columns.time"),
          meta: {
            displayName: t("widgets.latestEvents.columns.time"),
            type: "date",
            icon: Clock,
            dateOptions: {
              relative: true,
              includeTime: true,
            },
          },
        }),
        columnHelper.display({
          id: "transaction",
          header: t("widgets.latestEvents.columns.transaction"),
          cell: ({ row }) => (
            <a
              href={`${EXPLORER_BASE_URL}/tx/${row.original.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Web3TransactionHash
                hash={row.original.transactionHash}
                showFullHash={false}
                copyToClipboard
              />
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ),
          meta: {
            type: "none",
            icon: ExternalLink,
            enableCsvExport: false,
          },
          enableSorting: false,
        }),
      ] as ColumnDef<UserEvent>[]),
    [t]
  );

  return (
    <DataTable<UserEvent>
      name="dashboard-latest-events"
      data={events}
      columns={columns}
      initialSorting={INITIAL_SORTING}
      initialPageSize={5}
      toolbar={{ enableToolbar: false }}
      pagination={{ enablePagination: false }}
      advancedToolbar={{
        enableGlobalSearch: false,
        enableFilters: false,
        enableExport: false,
        enableViewOptions: false,
      }}
      bulkActions={{ enabled: false }}
      urlState={{ enabled: false }}
      customEmptyState={{
        icon: History,
        title: t("widgets.latestEvents.empty"),
        description: t("widgets.latestEvents.emptyDescription"),
      }}
    />
  );
}
