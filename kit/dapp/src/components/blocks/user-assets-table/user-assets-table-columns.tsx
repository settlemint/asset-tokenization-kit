"use client";

import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatDate } from "@/lib/utils/date";
import { formatHolderType } from "@/lib/utils/format-holder-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

const columnHelper = createColumnHelper<UserAsset>();

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  blocked: XCircle,
  unblocked: CheckCircle,
};

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.users.holdings.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tHolderType = useTranslations("holder-type");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tAssetType = useTranslations("asset-type");

  return [
    columnHelper.accessor("asset.name", {
      header: t("name-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.symbol", {
      header: t("symbol-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => tAssetType(row.asset.type), {
      id: t("type-header"),
      header: t("type-header"),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => formatHolderType(row, tHolderType), {
      id: t("holder-type-header"),
      header: t("holder-type-header"),
      enableColumnFilter: true,
    }),
    columnHelper.accessor(
      (row) => (row.blocked ? t("blocked-status") : t("active-status")),
      {
        id: t("status-header"),
        header: t("status-header"),
        cell: ({ row }) => {
          const { blocked } = row.original;
          const Icon = icons[blocked ? "blocked" : "unblocked"];
          return (
            <>
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              <span>{blocked ? t("blocked-status") : t("active-status")}</span>
            </>
          );
        },
        enableColumnFilter: true,
      }
    ),
    columnHelper.accessor("lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance" })
          : "-";
      },
      enableColumnFilter: false,
    }),
  ];
}
