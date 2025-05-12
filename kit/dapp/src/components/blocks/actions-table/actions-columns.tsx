"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { defineMeta, filterFn } from "@/lib/filters";
import type { Action } from "@/lib/queries/actions/actions-schema";
import { addressNameFilter } from "@/lib/utils/address-name-cache";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import { Info, Target, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getAddress, isAddress } from "viem";
import { ActionButton } from "./action-button";

const columnHelper = createColumnHelper<Action>();

export function Columns({
  state,
}: {
  state: "pending" | "upcoming" | "executed";
}) {
  const t = useTranslations("actions");
  const locale = useLocale();

  return [
    columnHelper.accessor("name", {
      header: t("columns.name"),
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1">
          <span>{t(`name.${getValue()}`)}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  aria-label={t(`description.${getValue()}`)}
                  className="size-4 text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent>{t(`description.${getValue()}`)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    }),
    columnHelper.accessor("target.id", {
      header: t("columns.subject"),
      cell: ({ getValue }) => {
        const target = getValue();
        if (isAddress(target)) {
          return (
            <EvmAddress address={target} prettyNames={false}>
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
        displayName: t("columns.subject"),
        icon: Target,
        type: "text",
      }),
    }),
    columnHelper.accessor("activeAt", {
      header: t("columns.active-at"),
      cell: ({ row }) =>
        row.original.activeAt
          ? formatDate(row.original.activeAt, {
              locale,
            })
          : null,
    }),
    ...(state === "executed"
      ? [
          columnHelper.accessor("executedAt", {
            header: t("columns.completed-on"),
            cell: ({ getValue }) =>
              formatDate(getValue()!, {
                locale,
              }),
          }),
          columnHelper.accessor("executedBy.id", {
            header: t("columns.executed-by"),
            cell: ({ getValue }) => (
              <EvmAddress address={getAddress(getValue())} prettyNames={false}>
                <EvmAddressBalances address={getAddress(getValue())} />
              </EvmAddress>
            ),
            meta: defineMeta((row) => row.executedBy!.id, {
              displayName: t("columns.executed-by"),
              icon: User,
              type: "text",
            }),
          }),
        ]
      : []),
    ...(state === "pending"
      ? [
          columnHelper.display({
            id: "actions",
            cell: ({ row }) => {
              return (
                <ActionButton
                  actionName={row.original.name}
                  target={row.original.target.id}
                />
              );
            },
            enableColumnFilter: false,
          }),
        ]
      : []),
  ];
}
