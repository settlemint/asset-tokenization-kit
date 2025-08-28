import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, FileText, Settings, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditTopicDialog } from "./edit-topic-dialog";
import { TopicActionsMenu } from "./topic-actions-menu";

const columnHelper = createStrictColumnHelper<TopicScheme>();

/**
 * Helper function to determine if a topic is a system topic
 * System topics are the predefined ATK protocol topics that cannot be modified
 * These are defined in contracts/system/ATKTopics.sol
 */
const SYSTEM_TOPIC_NAMES = new Set([
  "knowYourCustomer",
  "antiMoneyLaundering",
  "qualifiedInstitutionalInvestor",
  "professionalInvestor",
  "accreditedInvestor",
  "accreditedInvestorVerified",
  "regulationS",
  "issuerProspectusFiled",
  "issuerProspectusExempt",
  "issuerLicensed",
  "issuerReportingCompliant",
  "issuerJurisdiction",
  "collateral",
  "isin",
  "assetClassification",
  "basePrice",
  "contractIdentity",
]);

const isSystemTopic = (topic: TopicScheme): boolean => {
  return SYSTEM_TOPIC_NAMES.has(topic.name);
};

/**
 * Topics table component for displaying claim topics
 * Shows system topics (read-only) and custom topics (editable/deletable)
 */
export function TopicsTable() {
  const [editingTopic, setEditingTopic] = useState<TopicScheme | null>(null);
  const { t } = useTranslation("claim-topics-issuers");

  // Fetch topics data using ORPC
  const { data: topics } = useSuspenseQuery(
    orpc.system.claimTopics.topicList.queryOptions()
  );

  // Get current user data with roles
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  /**
   * Defines the column configuration for the topics table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("name", {
          header: t("claimTopics.table.columns.name"),
          meta: {
            displayName: t("claimTopics.table.columns.name"),
            type: "text",
            icon: FileText,
          },
        }),
        columnHelper.accessor(
          (row) => {
            const topicId = row.topicId;
            const truncatedId =
              topicId.length > 10
                ? `${topicId.slice(0, 6)}…${topicId.slice(-4)}`
                : topicId;
            return truncatedId;
          },
          {
            header: t("claimTopics.table.columns.id"),
            meta: {
              displayName: t("claimTopics.table.columns.id"),
              type: "text",
            },
          }
        ),

        columnHelper.display({
          id: "source",
          header: t("claimTopics.table.columns.source"),
          cell: ({ row }) => {
            const source = isSystemTopic(row.original) ? "system" : "custom";
            const isSystem = source === "system";

            return (
              <Badge
                variant={isSystem ? "secondary" : "outline"}
                className="gap-1"
              >
                {isSystem ? (
                  <>
                    <Shield className="h-3 w-3" />
                    {t("claimTopics.table.source.system")}
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3" />
                    {t("claimTopics.table.source.custom")}
                  </>
                )}
              </Badge>
            );
          },
          meta: {
            displayName: t("claimTopics.table.columns.source"),
            type: "option",
            icon: Settings,
            options: [
              {
                value: "system",
                label: t("claimTopics.table.source.system"),
                icon: Shield,
              },
              {
                value: "custom",
                label: t("claimTopics.table.source.custom"),
                icon: Edit,
              },
            ],
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("claimTopics.table.columns.actions"),
          meta: {
            type: "none",
            enableCsvExport: false,
          },
          cell: ({ row }) => {
            const topic = row.original;
            const isSystem = isSystemTopic(topic);
            const hasClaimPolicyManagerRole =
              user?.userSystemPermissions?.roles?.claimPolicyManager;

            if (isSystem || !hasClaimPolicyManagerRole) {
              return <span className="text-muted-foreground text-sm" />;
            }

            return (
              <TopicActionsMenu
                topic={topic}
                onEdit={() => {
                  setEditingTopic(topic);
                }}
              />
            );
          },
        }),
      ] as ColumnDef<TopicScheme>[]),
    [setEditingTopic, t, user]
  );

  return (
    <ComponentErrorBoundary componentName="Topics Table">
      <DataTable
        name="claim-topics"
        data={topics}
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
          placeholder: t("claimTopics.table.placeholder"),
        }}
        pagination={{
          enablePagination: true,
        }}
        initialSorting={[
          {
            id: "name",
            desc: false,
          },
        ]}
      />

      {editingTopic && (
        <EditTopicDialog
          topic={editingTopic}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingTopic(null);
          }}
        />
      )}
    </ComponentErrorBoundary>
  );
}
