"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { auth } from "@/lib/auth/auth";
import { formatDate } from "@/lib/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import {
  BadgeCheck,
  BadgePlus,
  BadgeX,
  Ban,
  Check,
  ShieldCheck,
  User2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { DeleteApiKeyAction } from "./delete-api-key-action";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof auth.api.listApiKeys>>[number]
  >();

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
  banned: Ban,
  active: Check,
  verified: BadgeCheck,
  notVerified: BadgeX,
};

export function Columns() {
  const t = useTranslations("portfolio.settings.api-keys");
  const locale = useLocale();

  return [
    columnHelper.accessor("name", {
      header: t("columns.name"),
      cell: ({ renderValue }) => <span>{renderValue()}</span>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("requestCount", {
      header: t("columns.rateLimit"),
      cell: ({ getValue, row }) => (
        <span>
          {row.original.rateLimitEnabled
            ? `${getValue()} / ${row.original.rateLimitMax}`
            : t("disabled")}
        </span>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("lastRequest", {
      header: t("columns.lastRequest"),
      cell: ({ getValue }) => (
        <span>
          {getValue() ? formatDate(getValue()!, { locale }) : t("never")}
        </span>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("expiresAt", {
      header: t("columns.expiresAt"),
      cell: ({ getValue }) => {
        const expiresAt = getValue();
        if (!expiresAt) return <span>{t("never")}</span>;
        if (expiresAt < new Date()) return <span>{t("expired")}</span>;
        return <span>{formatDate(expiresAt, { locale })}</span>;
      },
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "",
      cell: ({ row }) => (
        <DataTableRowActions
          actions={[
            {
              id: "delete-api-key",
              label: "Delete API Key",
              component: ({ open, onOpenChange }) => (
                <DeleteApiKeyAction
                  apiKey={row.original.id}
                  open={open}
                  onOpenChange={onOpenChange}
                />
              ),
            },
          ]}
        />
      ),
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
