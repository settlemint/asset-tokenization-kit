"use client";

import { icons } from "@/app/[locale]/(private)/assets/stablecoins/[address]/holders/_components/columns";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatDate } from "@/lib/utils/date";
import { formatHolderType } from "@/lib/utils/format-holder-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<UserAsset>();

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
    columnHelper.accessor("asset.type", {
      header: t("type-header"),
      cell: ({ getValue }) => tAssetType(getValue()),
      enableColumnFilter: false,
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
    columnHelper.display({
      header: t("holder-type-header"),
      enableColumnFilter: false,
      cell: ({ row }) => formatHolderType(row.original, tHolderType),
    }),
    columnHelper.accessor("blocked", {
      header: t("status-header"),
      cell: ({ getValue }) => {
        const blocked: boolean = getValue();
        const Icon = icons[blocked ? "blocked" : "unblocked"];
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>{blocked ? t("blocked-status") : t("active-status")}</span>
          </>
        );
      },
    }),
    columnHelper.accessor("account.lastActivity", {
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
