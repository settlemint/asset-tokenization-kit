import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Edit, FileText, Settings, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditTopicDialog } from "./edit-topic-dialog";
import { TopicActionsMenu } from "./topic-actions-menu";

const columnHelper = createColumnHelper<TopicScheme>();

/**
 * Helper function to determine if a topic is a system topic
 * System topics are the predefined ATK protocol topics that cannot be modified
 * These are defined in contracts/system/ATKTopics.sol
 */
const SYSTEM_TOPIC_NAMES = new Set([
  "kyc",
  "aml",
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
    orpc.system.topicList.queryOptions()
  );

  /**
   * Defines the column configuration for the topics table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("topicId", {
          header: t("claimTopics.table.columns.id"),
          cell: ({ getValue }) => {
            const topicId = getValue();
            return <span className="font-mono text-sm">{Number(topicId)}</span>;
          },
          meta: {
            displayName: t("claimTopics.table.columns.id"),
            type: "number",
            icon: FileText,
          },
        }),
        columnHelper.accessor("name", {
          header: t("claimTopics.table.columns.name"),
          cell: ({ getValue }) => {
            const name = getValue();
            return <span className="font-medium">{name}</span>;
          },
          meta: {
            displayName: t("claimTopics.table.columns.name"),
            type: "text",
            icon: FileText,
          },
        }),
        columnHelper.accessor(
          (row) => (isSystemTopic(row) ? "system" : "custom"),
          {
            id: "source",
            header: t("claimTopics.table.columns.source"),
            cell: ({ getValue }) => {
              const source = getValue();
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
          }
        ),
        columnHelper.display({
          id: "actions",
          header: t("claimTopics.table.columns.actions"),
          meta: {
            enableCsvExport: false,
          },
          cell: ({ row }) => {
            const topic = row.original;
            const isSystem = isSystemTopic(topic);

            if (isSystem) {
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
    [setEditingTopic, t]
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
            id: "topicId",
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
