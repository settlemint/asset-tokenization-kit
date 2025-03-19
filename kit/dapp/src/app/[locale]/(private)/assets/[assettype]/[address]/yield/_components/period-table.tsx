"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import type { Bond } from "@/lib/queries/bond/bond-fragment";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export interface PeriodTableProps {
  bond: Bond;
}

type YieldPeriod = NonNullable<Bond['yieldSchedule']>['periods'][number];

export function YieldPeriodTable({ bond }: PeriodTableProps) {
  const t = useTranslations("admin.bonds.yield.period-table");
  const locale = useLocale();

  const data = useMemo(() => {
    if (!bond.yieldSchedule || !bond.yieldSchedule.periods.length) {
      return [];
    }

    return bond.yieldSchedule.periods.sort(
      (a, b) => Number(a.periodId - b.periodId)
    );
  }, [bond]);

  const columns = useMemo<ColumnDef<YieldPeriod>[]>(
    () => [
      {
        accessorKey: "periodId",
        header: t("period-id"),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.periodId.toString()}</div>;
        },
      },
      {
        accessorKey: "startDate",
        header: t("start-date"),
        cell: ({ row }) => {
          return formatDate(new Date(Number(row.original.startDate) * 1000), { locale });
        },
      },
      {
        accessorKey: "endDate",
        header: t("end-date"),
        cell: ({ row }) => {
          return formatDate(new Date(Number(row.original.endDate) * 1000), { locale } );
        },
      },
      {
        accessorKey: "totalClaimed",
        header: t("claimed-total"),
        cell: ({ row }) => {
          const totalClaimed = Number(row.original.totalClaimed);
          const totalSupply = Number(bond.totalSupply);

          return (
            <div>
              {formatNumber(totalClaimed, { locale })} / {formatNumber(totalSupply, { locale })}
            </div>
          );
        },
      },
      {
        id: "progress",
        header: t("progress"),
        cell: ({ row }) => {
          const totalClaimed = Number(row.original.totalClaimed);
          const totalSupply = Number(bond.totalSupply);
          const percentage = totalSupply > 0
            ? (totalClaimed / totalSupply) * 100
            : 0;

          return (
            <PercentageProgressBar
              percentage={percentage}
            />
          );
        },
      },
    ],
    [t, bond.totalSupply, locale]
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