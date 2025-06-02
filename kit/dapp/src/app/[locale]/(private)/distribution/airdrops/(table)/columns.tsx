"use client";

import { AirdropTypeIcon } from "@/components/blocks/airdrop-type-icon/airdrop-type-icon";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { AirdropListItem } from "@/lib/queries/airdrop/airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<AirdropListItem>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.airdrops.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  return [
    columnHelper.accessor("id", {
      header: t("columns.id"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.accessor("type", {
      header: t("columns.type"),
      cell: ({ getValue }) => {
        const typeValue = getValue();
        return (
          <div className="flex items-center gap-2">
            <AirdropTypeIcon type={typeValue} size="sm" />
            <span className="capitalize">{t(`type.${typeValue}` as any)}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("asset", {
      header: t("columns.asset"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.accessor("totalClaimed", {
      header: t("columns.total-claimed"),
      cell: ({ getValue }) => {
        const value = getValue();
        return formatNumber(value, {
          locale,
        });
      },
    }),
    columnHelper.accessor("totalRecipients", {
      header: t("columns.total-recipients"),
      cell: ({ getValue }) => {
        const value = getValue();
        return formatNumber(value, {
          locale,
        });
      },
    }),

    columnHelper.display({
      id: "details",
      header: t("columns.details"),
      cell: ({ row }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(`/distribution/airdrops/${row.original.id}`);
            }}
          >
            {t("details")}
          </Button>
        );
      },
    }),
  ];
}
