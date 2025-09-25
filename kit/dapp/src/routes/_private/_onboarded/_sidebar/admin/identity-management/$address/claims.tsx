import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import type { CellContext, ColumnDef } from "@tanstack/table-core";
import { Shield } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

interface ClaimRow {
  id: string;
  name: string;
  revoked: boolean;
  issuer: {
    id: Address;
  };
  values: Array<{
    key: string;
    value: string;
  }>;
}

const columnHelper = createStrictColumnHelper<ClaimRow>();

/**
 * Claims tab page that displays all claims associated with an identity
 *
 * This route shows a table of claims with their status, name, and issuer information.
 * It uses the mock data loaded by the parent route.
 *
 * Route path: `/admin/identity-management/{address}/claims`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/$address/claims"
)({
  errorComponent: DefaultCatchBoundary,
  component: ClaimsPage,
});

function ClaimsPage() {
  const { claimsData } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/identity-management/$address",
  });
  const { t } = useTranslation("identities");

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
        // Hidden accessor for status filtering
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
        // Visible status display column
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

            // Show as compact badges for better readability
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
    <div className="space-y-4">
      <DataTable
        name="identity-claims"
        columns={columns}
        data={claimsData.claims}
        initialPageSize={10}
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
          description: t("claimsTable.emptyState.description"),
        }}
      />
    </div>
  );
}
