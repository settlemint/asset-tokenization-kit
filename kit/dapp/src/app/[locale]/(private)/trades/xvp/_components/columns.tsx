"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { XvpStatusPill } from "@/components/blocks/xvp-status/status-pill";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-list";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { isBefore } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlement>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  return [
    columnHelper.accessor("id", {
      header: t("columns.id"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.display({
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        return <XvpStatusPill xvp={row.original} />;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("columns.created-at"),
      cell: ({ getValue }) =>
        formatDate(getValue().toString(), { locale, type: "relative" }),
    }),
    columnHelper.accessor("cutoffDate", {
      header: t("columns.expires-at"),
      cell: ({ getValue }) => {
        const expiresAt = getValue();
        const isExpired = isBefore(
          Number(expiresAt) * 1000,
          new Date().getTime()
        );
        return (
          <>
            {isExpired
              ? ` ${t("expired")} ${formatDate(expiresAt.toString(), {
                  locale,
                  type: "relative",
                })}`
              : formatDate(expiresAt.toString(), {
                  locale,
                  type: "relative",
                })}
          </>
        );
      },
    }),
    columnHelper.accessor("approvals", {
      id: "approvals",
      header: t("columns.approvals"),
      cell: ({ row }) => {
        const approvals = row.original.approvals;
        const approvalsRequired = new Set(
          row.original.flows.map((flow) => flow.from.id)
        );
        const percentage = (approvals.length / approvalsRequired.size) * 100;
        return (
          <PercentageProgressBar
            percentage={percentage}
            label={`${approvals.length}/${approvalsRequired.size}`}
          />
        );
      },
    }),
    columnHelper.display({
      id: "details",
      header: t("details"),
      cell: ({ row }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/trades/xvp/${row.original.id}`);
            }}
          >
            {t("details")}
          </Button>
        );
      },
    }),
  ];
}
