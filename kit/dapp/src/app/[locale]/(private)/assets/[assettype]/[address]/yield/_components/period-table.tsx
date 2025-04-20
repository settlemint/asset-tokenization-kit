"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { Badge } from "@/components/ui/badge";
import type {
  YieldPeriod,
  YieldSchedule,
} from "@/lib/queries/bond/bond-schema";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import type { ColumnDef } from "@tanstack/react-table";
import { isAfter, isBefore } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

export interface PeriodTableProps {
  yieldSchedule: YieldSchedule;
}

export function YieldPeriodTable({ yieldSchedule }: PeriodTableProps) {
  const t = useTranslations("admin.bonds.yield.period-table");
  const locale = useLocale();

  const data = useMemo(() => {
    return yieldSchedule.periods.sort((a, b) =>
      Number(a.periodId - b.periodId)
    );
  }, [yieldSchedule]);

  const getPeriodStatus = useCallback(
    (period: YieldPeriod): "scheduled" | "current" | "completed" => {
      const currentTime = new Date();
      const periodStartDate = new Date(Number(period.startDate) * 1000);
      const periodEndDate = new Date(Number(period.endDate) * 1000);

      if (isBefore(currentTime, periodStartDate)) {
        return "scheduled";
      }
      if (isAfter(currentTime, periodEndDate)) {
        return "completed";
      }
      return "current";
    },
    []
  );

  const columns = useMemo<ColumnDef<YieldPeriod>[]>(
    () => [
      {
        accessorKey: "periodId",
        header: t("period-id"),
        cell: ({ row }) => {
          return (
            <div className="font-medium">
              {row.original.periodId.toString()}
            </div>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: t("start-date"),
        cell: ({ row }) => {
          return formatDate(new Date(Number(row.original.startDate) * 1000), {
            locale,
          });
        },
      },
      {
        accessorKey: "endDate",
        header: t("end-date"),
        cell: ({ row }) => {
          return formatDate(new Date(Number(row.original.endDate) * 1000), {
            locale,
          });
        },
      },
      {
        accessorKey: "totalClaimed",
        header: t("claimed-total"),
        cell: ({ row }) =>
          `${formatNumber(row.original.totalClaimed, { locale })} / ${formatNumber(row.original.totalYield, { locale })}`,
      },
      {
        id: "progress",
        header: t("progress"),
        cell: ({ row }) => {
          const percentage =
            (Number(row.original.totalClaimed) /
              Number(row.original.totalYield)) *
            100;

          return (
            <PercentageProgressBar
              percentage={isNaN(percentage) ? 0 : percentage}
              mode="inverted"
              errorThreshold={25}
              warningThreshold={75}
            />
          );
        },
      },
      {
        id: "status",
        header: t("status"),
        cell: ({ row }) => {
          const statusKey = getPeriodStatus(row.original);
          const statusLabel = t(statusKey);
          const statusVariantMap = {
            scheduled: "outline",
            current: "default",
            completed: "secondary",
          } as const;
          const variant = statusVariantMap[statusKey];

          return (
            <Badge variant={variant} className="capitalize">
              {statusLabel}
            </Badge>
          );
        },
      },
    ],
    [t, locale, getPeriodStatus]
  );

  const displayData = data.length > 0 ? data : [];

  return (
    <DataTable
      columns={() => columns}
      data={displayData}
      name="yield-periods"
    />
  );
}
