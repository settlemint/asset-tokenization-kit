import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Progress } from "@/components/ui/progress";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { FixedYieldSchedulePeriod } from "@atk/zod/fixed-yield-schedule";
import type { ColumnDef } from "@tanstack/react-table";
import { format, type Dnum } from "dnum";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const columnHelper = createStrictColumnHelper<FixedYieldSchedulePeriod>();

/**
 * Calculate progress percentage from claimed and total yield amounts
 */
function calculateProgress(claimed: Dnum, total: Dnum): number {
  const claimedNum = Number.parseFloat(claimed.toString());
  const totalNum = Number.parseFloat(total.toString());
  if (totalNum === 0) return 0;
  return Math.min((claimedNum / totalNum) * 100, 100);
}

/**
 * Format claimed/total amounts for display
 */
function formatClaimedTotal(
  claimed: Dnum,
  total: Dnum,
  symbol: string
): string {
  const claimedNum = format(claimed);
  const totalNum = format(total);
  return `${claimedNum} / ${totalNum} ${symbol}`;
}

/**
 * Props for the FixedYieldSchedulePeriodsTable component
 */
interface FixedYieldSchedulePeriodsTableProps {
  /** Current period ID */
  currentPeriodId: EthereumAddress | undefined;
  /** Array of yield schedule periods to display */
  periods: FixedYieldSchedulePeriod[];
  /** Asset symbol for currency formatting */
  assetSymbol: string;
  /** Optional title for the table section */
  title?: string;
  /** Optional description for the table section */
  description?: string;
  /** Whether to show the section header */
  showHeader?: boolean;
}

/**
 * Fixed Yield Schedule Periods Table Component
 *
 * A comprehensive data table for displaying yield schedule periods with progress tracking,
 * status indicators, and detailed period information. This component provides:
 * - Period ID, start/end dates
 * - Claimed vs total amounts with progress visualization
 * - Status badges (scheduled, active, completed)
 * - Export and view options
 *
 * @param props - Component props
 * @returns JSX element containing the periods table
 *
 * @example
 * ```tsx
 * <FixedYieldSchedulePeriodsTable
 *   periods={yieldSchedule.periods}
 *   assetSymbol={asset.symbol}
 *   title="All periods"
 *   description="Complete overview of all yield periods"
 * />
 * ```
 */
export function FixedYieldSchedulePeriodsTable({
  currentPeriodId,
  periods,
  assetSymbol,
  title,
  description,
  showHeader = true,
}: FixedYieldSchedulePeriodsTableProps) {
  const { t } = useTranslation(["tokens"]);

  // Columns definition for periods table
  const periodsColumns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("startDate", {
          header: t("tokens:yield.periodsTable.columns.startDate"),
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.startDate"),
            type: "date",
            dateOptions: {
              includeTime: true,
            },
          },
        }),
        columnHelper.accessor("endDate", {
          header: t("tokens:yield.periodsTable.columns.endDate"),
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.endDate"),
            type: "date",
            dateOptions: {
              includeTime: true,
            },
          },
        }),
        columnHelper.accessor(
          (row) => {
            return formatClaimedTotal(
              row.totalClaimed,
              row.totalYield,
              assetSymbol
            );
          },
          {
            id: "claimedTotal",
            header: t("tokens:yield.periodsTable.columns.claimedTotal"),
            meta: {
              displayName: t("tokens:yield.periodsTable.columns.claimedTotal"),
              type: "text",
            },
          }
        ),
        columnHelper.display({
          id: "progress",
          header: t("tokens:yield.periodsTable.columns.progress"),
          cell: ({ row }) => {
            const progress = calculateProgress(
              row.original.totalClaimed,
              row.original.totalYield
            );
            return (
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-16 h-2" />
                <span className="text-sm text-muted-foreground">
                  {progress.toFixed(1)}%
                </span>
              </div>
            );
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.progress"),
            type: "none",
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("tokens:yield.periodsTable.columns.status"),
          cell: ({ row }) => {
            if (row.original.completed) {
              return t("tokens:yield.periodsTable.status.completed");
            }
            if (row.original.id === currentPeriodId) {
              return t("tokens:yield.periodsTable.status.active");
            }
            return t(`tokens:yield.periodsTable.status.scheduled`);
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.status"),
            type: "none",
          },
        }),
      ] as ColumnDef<FixedYieldSchedulePeriod>[]),
    [t, assetSymbol]
  );

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <h3 className="text-lg font-semibold mb-2">
          {t("tokens:yield.periodsTable.empty.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("tokens:yield.periodsTable.empty.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div>
          <h2 className="text-xl font-medium text-accent">
            {title || t("tokens:yield.periodsTable.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description || t("tokens:yield.periodsTable.description")}
          </p>
        </div>
      )}
      <DataTable
        name="yield-periods"
        data={periods}
        columns={periodsColumns}
        urlState={{
          enabled: false,
          enableUrlPersistence: false,
          enableRowSelection: false,
          defaultPageSize: 10,
        }}
        advancedToolbar={{
          enableGlobalSearch: true,
          enableFilters: true,
          enableExport: false,
          enableViewOptions: false,
        }}
      />
    </div>
  );
}
