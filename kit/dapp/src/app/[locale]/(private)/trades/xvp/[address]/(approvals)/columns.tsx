"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { ApprovalStatusBadge } from "@/components/blocks/xvp-status/approval-status-badge";
import type { XvPSettlementApproval } from "@/lib/queries/xvp/xvp-schema";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlementApproval>();

export function columns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("account.id", {
      header: t("columns.approver"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.accessor("approved", {
      header: t("columns.status"),
      cell: ({ getValue }) => <ApprovalStatusBadge hasApproved={getValue()} />,
    }),
    columnHelper.accessor("timestamp", {
      header: t("columns.approved-at"),
      cell: ({ getValue, row }) => {
        const timestamp = getValue();
        if (row.original.approved && timestamp) {
          return formatDate(timestamp.toString(), {
            locale,
            type: "relative",
          });
        }
        return "-";
      },
    }),
  ];
}
