import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { useQuery } from "@tanstack/react-query";
import type { CellContext, ColumnDef } from "@tanstack/table-core";
import { Shield } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

export type ClaimRow = Identity["claims"][number];

export interface ClaimsTableProps {
  identityAddress: Address;
  initialClaims?: ClaimRow[];
  name?: string;
  initialPageSize?: number;
}

const columnHelper = createStrictColumnHelper<ClaimRow>();

export function ClaimsTable({
  identityAddress,
  name = "identity-claims",
  initialPageSize = 10,
}: ClaimsTableProps) {
  const { t } = useTranslation("identities");

  const { data, isLoading, isFetching, isError, error } = useQuery(
    orpc.system.identity.read.queryOptions({
      input: { identityId: identityAddress },
    })
  );

  const claims = data?.claims ?? [];
  const showLoadingState = isLoading || isFetching;
  const emptyStateDescription =
    isError && error instanceof Error
      ? error.message
      : t("claimsTable.emptyState.description");

  const columns = useMemo(
    (): ColumnDef<ClaimRow>[] =>
      withAutoFeatures([
        columnHelper.accessor("name", {
          id: "name",
          header: t("claimsTable.columns.claimName"),
          enableHiding: false,
          meta: {
            displayName: t("claimsTable.columns.claimName"),
            type: "text",
          },
        }),
        columnHelper.accessor(
          (row: ClaimRow) => (row.revoked ? "revoked" : "active"),
          {
            id: "status_filter",
            header: "",
            enableHiding: false,
            meta: {
              displayName: t("claimsTable.columns.status"),
              type: "text",
            },
          }
        ),
        columnHelper.display({
          id: "status",
          header: t("claimsTable.columns.status"),
          cell: ({ row }: CellContext<ClaimRow, boolean>) => {
            const isRevoked = row.original.revoked;
            return (
              <Badge
                variant={isRevoked ? "destructive" : "default"}
                className="capitalize"
              >
                {isRevoked
                  ? t("claimsTable.status.revoked")
                  : t("claimsTable.status.active")}
              </Badge>
            );
          },
          meta: {
            displayName: t("claimsTable.columns.status"),
            type: "none",
          },
        }),
        columnHelper.accessor("issuer.id", {
          id: "issuer",
          header: t("claimsTable.columns.issuer"),
          enableHiding: false,
          meta: {
            displayName: t("claimsTable.columns.issuer"),
            type: "address",
          },
        }),
        columnHelper.display({
          id: "claimData",
          header: t("claimsTable.columns.claimData"),
          cell: ({ row }: CellContext<ClaimRow, unknown>) => {
            const values = row.original.values;
            if (!values || values.length === 0) {
              return (
                <span className="text-muted-foreground text-sm">
                  {t("claimsTable.noClaimData")}
                </span>
              );
            }

            return (
              <div className="flex flex-wrap gap-1">
                {values.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item.key}: {item.value}
                  </Badge>
                ))}
              </div>
            );
          },
          meta: {
            displayName: t("claimsTable.columns.claimData"),
            type: "none",
          },
        }),
      ] as ColumnDef<ClaimRow>[]),
    [t]
  );

  return (
    <DataTable
      name={name}
      columns={columns}
      data={claims}
      isLoading={showLoadingState}
      initialPageSize={initialPageSize}
      advancedToolbar={{
        enableGlobalSearch: false,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
      }}
      initialColumnVisibility={{
        status_filter: false,
      }}
      customEmptyState={{
        icon: Shield,
        title: t("claimsTable.emptyState.title"),
        description: emptyStateDescription,
      }}
    />
  );
}
