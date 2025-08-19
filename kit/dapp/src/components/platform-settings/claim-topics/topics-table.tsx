import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Badge } from "@/components/ui/badge";
import { TopicActionsMenu } from "./topic-actions-menu";
import { EditTopicDialog } from "./edit-topic-dialog";
import { orpc } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Settings, FileText, Shield, Edit } from "lucide-react";
import { useState, useMemo } from "react";

const columnHelper = createColumnHelper<TopicScheme>();

/**
 * Helper function to determine if a topic is a system topic
 * System topics have IDs 1-100 and cannot be modified
 */
const isSystemTopic = (topicId: string): boolean => {
  const id = BigInt(topicId);
  return id >= 1n && id <= 100n;
};

/**
 * Helper function to get topic description based on common system topics
 */
const getTopicDescription = (name: string, topicId: string): string => {
  if (!isSystemTopic(topicId)) {
    return `Custom topic: ${name}`;
  }

  // Common system topic descriptions
  const systemDescriptions: Record<string, string> = {
    "KYC Level": "Basic identity verification status",
    "AML Check": "Anti-money laundering clearance",
    "Accreditation": "Investor accreditation status", 
    "Country": "Jurisdiction verification",
  };

  return systemDescriptions[name] || `System topic: ${name}`;
};

/**
 * Topics table component for displaying claim topics
 * Shows system topics (read-only) and custom topics (editable/deletable)
 */
export function TopicsTable() {
  const [editingTopic, setEditingTopic] = useState<TopicScheme | null>(null);

  // Fetch topics data using ORPC
  const { data: topics } = useSuspenseQuery(
    orpc.system.topicList.queryOptions()
  );

  // Check if we have topics to display
  const hasTopics = topics && topics.length > 0;

  /**
   * Defines the column configuration for the topics table
   */
  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("topicId", {
          header: "ID",
          cell: ({ getValue }) => {
            const topicId = getValue();
            return (
              <span className="font-mono text-sm">
                {Number(topicId)}
              </span>
            );
          },
          meta: {
            displayName: "ID",
            type: "number",
            icon: FileText,
          },
        }),
        columnHelper.accessor("name", {
          header: "Name",
          cell: ({ getValue }) => {
            const name = getValue();
            return (
              <span className="font-medium">
                {name}
              </span>
            );
          },
          meta: {
            displayName: "Name",
            type: "text",
            icon: FileText,
          },
        }),
        columnHelper.accessor(
          (row) => getTopicDescription(row.name, row.topicId),
          {
            id: "description",
            header: "Description",
            cell: ({ getValue }) => (
              <span className="text-muted-foreground text-sm">
                {getValue()}
              </span>
            ),
            meta: {
              displayName: "Description",
              type: "text",
              icon: FileText,
            },
          }
        ),
        columnHelper.accessor(
          (row) => isSystemTopic(row.topicId) ? "system" : "custom",
          {
            id: "source",
            header: "Source",
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
                      System
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3" />
                      Custom
                    </>
                  )}
                </Badge>
              );
            },
            meta: {
              displayName: "Source",
              type: "option",
              icon: Settings,
              options: [
                {
                  value: "system",
                  label: "System",
                  icon: Shield,
                },
                {
                  value: "custom", 
                  label: "Custom",
                  icon: Edit,
                },
              ],
            },
          }
        ),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          meta: {
            enableCsvExport: false,
          },
          cell: ({ row }) => {
            const topic = row.original;
            const isSystem = isSystemTopic(topic.topicId);
            
            if (isSystem) {
              return (
                <span className="text-muted-foreground text-sm">
                  —
                </span>
              );
            }

            return (
              <TopicActionsMenu
                topic={topic}
                onEdit={() => { setEditingTopic(topic); }}
              />
            );
          },
        }),
      ] as ColumnDef<TopicScheme>[]),
    [setEditingTopic]
  );

  return (
    <ComponentErrorBoundary componentName="Topics Table">
      {!hasTopics ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Topics Found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            No claim topics are currently registered in the system. System topics should be automatically created during system setup.
          </p>
          <p className="text-xs text-muted-foreground">
            If you're expecting to see system topics (KYC, AML, etc.), please check that the system has been properly initialized.
          </p>
        </div>
      ) : (
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
            placeholder: "Search topics...",
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
      )}

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