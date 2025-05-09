"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getIncompleteActions } from "@/lib/actions/incomplete";
import { actionTypes } from "@/lib/actions/types";
import { defineMeta, filterFn } from "@/lib/filters";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { AsteriskIcon, CalendarIcon, PlayCircleIcon } from "lucide-react";
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
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.actionType, {
        displayName: t("action-type-header"),
        icon: PlayCircleIcon,
        type: "option",
        options: Object.values(actionTypes).map((actionType) => ({
          label: t(`action-type.${actionType}`),
          value: actionType,
        })),
      }),
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
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (isAddress(row.original.subject)) {
          return addressNameFilter(row, columnId, filterValue);
        }
        return filterFn("text")(row, columnId, filterValue);
      },
      meta: defineMeta((row) => row.id, {
        displayName: t("subject"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("id", {
      header: t("description-header"),
      cell: ({ row }) => t(`upcoming-description.${row.original.actionType}`),
      enableColumnFilter: false,
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
      enableColumnFilter: true,
      filterFn: filterFn("date"),
      meta: defineMeta((row) => row.activeAtMs, {
        displayName: t("active-on-header"),
        icon: CalendarIcon,
        type: "date",
      }),
    }),
  ];
}
