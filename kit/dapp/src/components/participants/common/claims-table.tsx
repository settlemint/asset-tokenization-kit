import { DataTable } from "@/components/data-table/data-table";
import "@/components/data-table/filters/types/table-extensions";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/orpc/orpc-client";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { useQuery } from "@tanstack/react-query";
import type { CellContext, ColumnDef } from "@tanstack/table-core";
import { MoreHorizontal, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";
import { RevokeClaimDialog } from "./dialogs/revoke-claim-dialog";

export type ClaimRow = Identity["claims"][number];

export interface ClaimsTableProps {
  identityAddress: Address;
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

  const { data: system } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Trusted issuers data is not needed for revocation logic
  // as only identity owners can revoke claims through the UI

  const claims = data?.claims ?? [];
  const showLoadingState = isLoading || isFetching;
  const emptyStateDescription =
    isError && error instanceof Error
      ? error.message
      : t("claimsTable.emptyState.description");

  // Note: Claim revoke permission is not used in the current implementation
  // as we only allow users to revoke claims on their own identity
  // (users with MANAGEMENT_KEY, which identity owners have by default)
  const userIdentityAddressLower =
    system?.userIdentity?.address?.toLowerCase() ?? null;
  const tableIdentityAddressLower = identityAddress.toLowerCase();
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRow | null>(null);

  const handleRevokeDialogOpenChange = (open: boolean) => {
    setIsRevokeDialogOpen(open);
    if (!open) {
      setSelectedClaim(null);
    }
  };

  const columns = useMemo((): ColumnDef<ClaimRow>[] => {
    const statusLabels = {
      active: t("claimsTable.status.active"),
      revoked: t("claimsTable.status.revoked"),
    } as const;

    const statusOptions = (
      Object.entries(statusLabels) as Array<[keyof typeof statusLabels, string]>
    ).map(([value, label]) => ({
      value,
      label,
    }));

    return withAutoFeatures([
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
            type: "option",
            options: statusOptions,
            transformOptionFn: (value) => {
              const normalizedValue =
                typeof value === "string"
                  ? value
                  : value == null
                    ? ""
                    : String(value);
              const label =
                statusLabels[normalizedValue as keyof typeof statusLabels];

              return {
                value: normalizedValue,
                label: label ?? normalizedValue,
              };
            },
          },
        }
      ),
      columnHelper.display({
        id: "status",
        header: t("claimsTable.columns.status"),
        cell: ({ row }) => {
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
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }: CellContext<ClaimRow, unknown>) => {
          const claim = row.original;
          const isRevoked = claim.revoked;
          // Only allow revocation if the user's identity matches the table's identity
          // This aligns with the API which requires MANAGEMENT_KEY on the target identity
          const canRevoke = Boolean(
            userIdentityAddressLower &&
              userIdentityAddressLower === tableIdentityAddressLower
          );

          if (isRevoked || !canRevoke) {
            return null;
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedClaim(claim);
                    setIsRevokeDialogOpen(true);
                  }}
                >
                  {t("claimsTable.actions.revoke")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        meta: {
          displayName: t("claimsTable.columns.actions"),
          type: "none",
        },
      }),
    ] as ColumnDef<ClaimRow>[]);
  }, [t, identityAddress, userIdentityAddressLower, tableIdentityAddressLower]);

  return (
    <>
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
      {selectedClaim ? (
        <RevokeClaimDialog
          open={isRevokeDialogOpen}
          onOpenChange={handleRevokeDialogOpenChange}
          claim={selectedClaim}
          identityAddress={identityAddress}
        />
      ) : null}
    </>
  );
}
