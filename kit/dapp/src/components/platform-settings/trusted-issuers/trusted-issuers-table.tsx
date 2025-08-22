import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { TrustedIssuer } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { FileText, Hash } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditIssuerTopicsDialog } from "./edit-issuer-topics-dialog";
import { TrustedIssuerActionsMenu } from "./trusted-issuer-actions-menu";

const columnHelper = createColumnHelper<TrustedIssuer>();

/**
 * Trusted issuers table component for displaying and managing trusted issuers
 * Shows issuer identity, assigned topics, and actions for each issuer
 */
export function TrustedIssuersTable() {
  const [editingIssuer, setEditingIssuer] = useState<TrustedIssuer | null>(
    null
  );
  const { t } = useTranslation("claim-topics-issuers");

  // Fetch trusted issuers data using ORPC
  const { data: trustedIssuers } = useSuspenseQuery(
    orpc.system.trustedIssuers.list.queryOptions()
  );

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  /**
   * Defines the column configuration for the trusted issuers table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("id", {
          header: t("trustedIssuers.table.columns.issuerIdentity"),
          cell: ({ getValue }) => {
            const address = getValue();
            return (
              <Web3Address
                address={address}
                size="tiny"
                copyToClipboard={true}
                showPrettyName={true}
                showBadge={true}
              />
            );
          },
          meta: {
            displayName: t("trustedIssuers.table.columns.issuerIdentity"),
            type: "text",
            icon: Hash,
          },
        }),
        columnHelper.accessor("claimTopics", {
          header: t("trustedIssuers.table.columns.assignedTopics"),
          cell: ({ getValue }) => {
            const topics = getValue();

            if (topics.length === 0) {
              return (
                <span className="text-muted-foreground text-sm">
                  {t("trustedIssuers.table.noTopics")}
                </span>
              );
            }

            return (
              <div className="flex flex-wrap gap-1">
                {topics.slice(0, 3).map((topic) => (
                  <Badge
                    key={topic.id}
                    variant="secondary"
                    className="text-xs"
                    title={`${topic.name} (ID: ${topic.topicId})`}
                  >
                    {topic.name}
                  </Badge>
                ))}
                {topics.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        +{topics.length - 3} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">Additional topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {topics.slice(3).map((topic) => (
                            <Badge
                              key={topic.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {topic.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          },
          meta: {
            displayName: t("trustedIssuers.table.columns.assignedTopics"),
            type: "text",
            icon: FileText,
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("trustedIssuers.table.columns.actions"),
          meta: {
            enableCsvExport: false,
          },
          cell: ({ row }) => {
            const issuer = row.original;
            const hasClaimPolicyManagerRole =
              user?.userSystemPermissions?.roles?.claimPolicyManager;

            if (!hasClaimPolicyManagerRole) {
              return <span className="text-muted-foreground text-sm" />;
            }

            return (
              <TrustedIssuerActionsMenu
                issuer={issuer}
                onEditTopics={() => {
                  setEditingIssuer(issuer);
                }}
              />
            );
          },
        }),
      ] as ColumnDef<TrustedIssuer>[]),
    [setEditingIssuer, t, user]
  );

  return (
    <ComponentErrorBoundary componentName="Trusted Issuers Table">
      <DataTable
        name="trusted-issuers"
        data={trustedIssuers}
        columns={columns}
        urlState={{
          enabled: true,
          enableUrlPersistence: false,
          defaultPageSize: 10,
          enableGlobalFilter: true,
          enableRowSelection: false,
          debounceMs: 300,
        }}
        advancedToolbar={{
          enableGlobalSearch: true,
          enableFilters: true,
          enableExport: true,
          enableViewOptions: true,
          placeholder: t("trustedIssuers.table.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={[
          {
            id: "id",
            desc: false,
          },
        ]}
      />

      {editingIssuer && (
        <EditIssuerTopicsDialog
          issuer={editingIssuer}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingIssuer(null);
          }}
        />
      )}
    </ComponentErrorBoundary>
  );
}
