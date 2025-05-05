"use client";

import type { getXvPSettlementList } from "@/lib/queries/xvp/xvp-list";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof getXvPSettlementList>>[number]
  >();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("actions");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("createdAt", {
      header: t("action-type-header"),
      cell: ({ getValue }) => formatDate(getValue().toString(), { locale }),
    }),
    columnHelper.accessor("cutoffDate", {
      header: t("action-type-header"),
      cell: ({ getValue }) => formatDate(getValue().toString(), { locale }),
    }),
    columnHelper.accessor("flows", {
      header: t("subject"),
      cell: ({ getValue }) => {
        return <>hey</>;
      },
    }),
  ];
}
