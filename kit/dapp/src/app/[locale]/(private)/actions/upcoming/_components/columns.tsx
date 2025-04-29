"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getIncompleteActions } from "@/lib/actions/incomplete";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { isAddress } from "viem";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof getIncompleteActions>>["pending"][number]
  >();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("actions");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("actionType", {
      header: t("action-type-header"),
      cell: ({ getValue }) => t(`action-type.${getValue()}`),
    }),
    columnHelper.accessor("subject", {
      header: t("subject"),
      cell: ({ getValue }) => {
        const subject = getValue();
        if (isAddress(subject)) {
          return (
            <EvmAddress address={subject} copyToClipboard={true} verbose={true}>
              <EvmAddressBalances address={subject} />
            </EvmAddress>
          );
        }

        return subject;
      },
    }),
    columnHelper.accessor("id", {
      header: t("description-header"),
      cell: ({ row }) => t(`upcoming-description.${row.original.actionType}`),
    }),
    columnHelper.accessor("activeAtMs", {
      header: t("active-on-header"),
      cell: ({ row }) =>
        `${formatDate(row.original.activeAtMs.toString(), {
          locale,
        })} (${formatDate(row.original.activeAtMs.toString(), {
          locale,
          type: "distance",
        })})`,
    }),
  ];
}
