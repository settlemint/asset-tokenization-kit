"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { ApprovalStatus } from "@/components/blocks/xvp/approval-status";
import type { XvPSettlementApproval } from "@/lib/queries/xvp/xvp-schema";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<XvPSettlementApproval>();

export function columns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("trade-management.xvp");

  return [
    columnHelper.accessor("account.id", {
      header: t("columns.user"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue()} copyToClipboard />
      ),
    }),
    columnHelper.accessor("approved", {
      header: t("columns.status"),
      cell: ({ getValue }) => <ApprovalStatus hasApproved={getValue()} />,
    }),
  ];
}
