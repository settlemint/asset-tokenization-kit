"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { actionTypes } from "@/lib/actions/types";
import { defineMeta, filterFn } from "@/lib/filters";
import type { Action } from "@/lib/queries/actions/actions-schema";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AsteriskIcon,
  CalendarIcon,
  PlayCircleIcon,
  User2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getAddress, isAddress } from "viem";

const columnHelper = createColumnHelper<Action>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("actions");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  return [
    columnHelper.accessor("type", {
      header: t("action-type-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.type, {
        displayName: t("action-type-header"),
        icon: PlayCircleIcon,
        type: "option",
        options: Object.values(actionTypes).map((actionType) => ({
          label: t(`action-type.${actionType}`),
          value: actionType,
        })),
      }),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("target.id", {
      header: "Target",
      cell: ({ getValue }) => {
        const target = getValue();
        if (isAddress(target)) {
          return (
            <EvmAddress address={target} copyToClipboard={true} verbose={true}>
              <EvmAddressBalances address={target} />
            </EvmAddress>
          );
        }

        return target;
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (isAddress(row.original.target.id)) {
          return addressNameFilter(row, columnId, filterValue);
        }
        return filterFn("text")(row, columnId, filterValue);
      },
      meta: defineMeta((row) => row.target.id, {
        displayName: "Target",
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("executedBy.id", {
      header: "Executed By",
      cell: ({ getValue }) => {
        const executedBy = getValue();
        if (executedBy) {
          return (
            <EvmAddress
              address={getAddress(executedBy)}
              copyToClipboard={true}
              verbose={true}
            />
          );
        }
        return null;
      },
      enableColumnFilter: true,
      filterFn: addressNameFilter,
      meta: defineMeta((row) => row.executedBy?.id, {
        displayName: t("sender-header"),
        icon: User2Icon,
        type: "text",
      }),
    }),
    columnHelper.accessor("executedAt", {
      header: t("completed-on-header"),
      cell: ({ row }) =>
        row.original.executedAt
          ? formatDate(row.original.executedAt, {
              locale,
            })
          : null,
      enableColumnFilter: true,
      filterFn: filterFn("date"),
      meta: defineMeta((row) => row.executedAt, {
        displayName: t("completed-on-header"),
        icon: CalendarIcon,
        type: "date",
      }),
    }),
    columnHelper.accessor("activeAt", {
      header: t("active-on-header"),
      cell: ({ row }) =>
        row.original.activeAt
          ? formatDate(row.original.activeAt, {
              locale,
            })
          : null,
    }),
  ];
}
