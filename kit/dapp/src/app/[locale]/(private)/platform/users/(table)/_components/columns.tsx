"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getUserList } from "@/lib/queries/user/user-list";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/utils/typebox/user-roles";
import { userRoles } from "@/lib/utils/typebox/user-roles";
import { createColumnHelper } from "@tanstack/react-table";
import {
  BadgeCheck,
  BadgePlus,
  BadgeX,
  Ban,
  Check,
  MoreHorizontal,
  ShieldCheck,
  User2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, Suspense } from "react";
import { BanUserAction } from "./actions/ban-user-action";
import { ChangeRoleAction } from "./actions/change-role-action";
import { UpdateKycStatusAction } from "./actions/update-kyc-status-action";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getUserList>>[number]>();

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
  const t = useTranslations("private.users");

  const STATUS_OPTIONS = [
    { label: t("status.active"), value: "active" },
    { label: t("status.banned"), value: "banned" },
  ];

  const ROLE_OPTIONS = userRoles.map((role) => ({
    label: t(`roles.${role}`),
    value: role,
  }));

  return [
    columnHelper.accessor("name", {
      header: t("columns.name"),
      cell: ({ renderValue, row }) => (
        <>
          <Suspense fallback={<Skeleton className="size-8 rounded-lg" />}>
            <AddressAvatar
              email={row.original.email}
              address={row.original.wallet}
              size="small"
            />
          </Suspense>
          <span>{renderValue()}</span>
          {row.original.banned && (
            <Badge variant="destructive">
              {t("banned_reason", { reason: row.original.ban_reason ?? "" })}
            </Badge>
          )}
        </>
      ),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.name, {
        displayName: t("columns.name"),
        icon: User2,
        type: "text",
      }),
    }),
    columnHelper.accessor("wallet", {
      header: t("columns.wallet"),
      cell: ({ getValue }) =>
        getValue() && (
          <div className="flex items-center">
            <EvmAddress
              address={getValue()}
              prettyNames={false}
              copyToClipboard={true}
            >
              <EvmAddressBalances address={getValue()} />
            </EvmAddress>
          </div>
        ),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.wallet || "", {
        displayName: t("columns.wallet"),
        icon: ShieldCheck,
        type: "text",
      }),
    }),
    columnHelper.accessor("email", {
      header: t("columns.email"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.email, {
        displayName: t("columns.email"),
        icon: User2,
        type: "text",
      }),
    }),
    columnHelper.accessor("role", {
      header: t("columns.role"),
      cell: ({ getValue }) => {
        const role = getValue() as UserRole;
        const Icon = role ? icons[role] : null;
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>{t(`roles.${role}`)}</span>
          </>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.role as UserRole, {
        displayName: t("columns.role"),
        icon: ShieldCheck,
        type: "option",
        options: ROLE_OPTIONS,
      }),
    }),
    columnHelper.accessor((row) => (row.banned ? "banned" : "active"), {
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const { banned } = row.original;
        const status = banned ? "banned" : "active";
        const Icon = icons[status];
        return (
          <Badge
            variant={banned ? "destructive" : "default"}
            className={cn(
              "bg-destructive/80 text-destructive-foreground",
              !banned && "bg-success/80 text-success-foreground"
            )}
          >
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>{t(`status.${status}`)}</span>
          </Badge>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => (row.banned ? "banned" : "active"), {
        displayName: t("columns.status"),
        icon: Check,
        type: "option",
        options: STATUS_OPTIONS,
      }),
    }),
    columnHelper.accessor("kyc_verified_at", {
      header: t("columns.kyc_status"),
      cell: ({ getValue }) => {
        const verified = getValue();
        const status = verified ? "verified" : "notVerified";
        const Icon = icons[status];
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>
              {status === "verified"
                ? t("status.verified")
                : t("status.not_verified")}
            </span>
          </>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "",
      cell: ({ row }) => (
        <DataTableRowActions
          detailUrl={`/platform/users/${row.original.id}`}
          actions={[
            {
              id: "ban-user",
              label: row.original.banned ? "Unban User" : "Ban User",
              component: ({ open, onOpenChange }) => (
                <BanUserAction
                  user={row.original}
                  open={open}
                  onOpenChange={onOpenChange}
                />
              ),
            },
            {
              id: "change-role",
              label: "Change Role",
              component: ({ open, onOpenChange }) => (
                <ChangeRoleAction
                  user={row.original}
                  open={open}
                  onOpenChange={onOpenChange}
                />
              ),
            },
            {
              id: "update-kyc-status",
              label: "Update KYC Status",
              component: ({ open, onOpenChange }) => (
                <UpdateKycStatusAction
                  user={row.original}
                  open={open}
                  onOpenChange={onOpenChange}
                />
              ),
            },
          ]}
        />
      ),
      meta: {
        displayName: "Actions",
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as any,
    }),
  ];
}
