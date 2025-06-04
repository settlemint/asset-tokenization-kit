"use client";

import { AirdropTypeIndicator } from "@/components/blocks/airdrop-type-indicator/airdrop-type-indicator";
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
        return <AirdropTypeIndicator type={typeValue} />;
      },
    }),
    columnHelper.accessor("asset", {
      header: t("columns.asset"),
      cell: ({ row }) => <EvmAddress address={row.original.asset.id} />,
    }),
    columnHelper.accessor("totalClaimed", {
      header: t("columns.total-claimed"),
      cell: ({ row, getValue }) => {
        const value = getValue();
        return formatNumber(value, {
          locale,
          token: row.original.asset.symbol,
        });
      },
    }),
    columnHelper.accessor("totalRecipients", {
      header: t("columns.total-claims"),
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
              router.push(
                `/distribution/airdrops/${row.original.type}/${row.original.id}`
              );
            }}
          >
            {t("details")}
          </Button>
        );
      },
    }),
  ];
}
