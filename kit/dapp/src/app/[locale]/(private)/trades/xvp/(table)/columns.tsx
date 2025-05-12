"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { XvpStatusPill } from "@/components/blocks/xvp/status-pill";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
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
      header: t("columns.expiry"),
      cell: ({ getValue }) =>
        formatDate(getValue().toString(), {
          locale,
          type: "relative",
        }),
    }),
    columnHelper.accessor("approvals", {
      id: "approvals",
      header: t("columns.approvals"),
      cell: ({ row }) => {
        const allApprovalEntries = row.original.approvals;
        const actualApprovalsCount = allApprovalEntries.filter(
          (approval) => approval.approved
        ).length;
        const approvalsRequiredCount = allApprovalEntries.length;

        const percentage =
          approvalsRequiredCount > 0
            ? (actualApprovalsCount / approvalsRequiredCount) * 100
            : 0;

        return (
          <PercentageProgressBar
            percentage={percentage}
            label={`${actualApprovalsCount}/${approvalsRequiredCount}`}
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
