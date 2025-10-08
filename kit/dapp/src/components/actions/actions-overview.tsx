"use client";

import { ActionsTable } from "@/components/actions/actions-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/orpc/orpc-client";
import type {
  Action,
  ActionStatus,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type TabId = "pending" | "upcoming" | "completed";

interface TabDefinition {
  id: TabId;
  label: string;
  statuses: readonly ActionStatus[];
  defaultSorting: SortingState;
}

type TabWithCount = TabDefinition & { count: number };

const TAB_IDS: readonly TabId[] = ["pending", "upcoming", "completed"] as const;

const BASE_TABS: Array<Omit<TabDefinition, "label">> = [
  {
    id: "pending",
    statuses: ["ACTIVE"],
    defaultSorting: [
      {
        id: "activeAt",
        desc: false,
      },
    ],
  },
  {
    id: "upcoming",
    statuses: ["PENDING"],
    defaultSorting: [
      {
        id: "activeAt",
        desc: false,
      },
    ],
  },
  {
    id: "completed",
    statuses: ["EXECUTED", "EXPIRED"],
    defaultSorting: [
      {
        id: "executedAt",
        desc: true,
      },
    ],
  },
];

function countByStatuses(
  actions: Action[],
  statuses: readonly ActionStatus[]
): number {
  return actions.reduce((acc, action) => {
    return acc + (statuses.includes(action.status) ? 1 : 0);
  }, 0);
}

/**
 * Renders the tabbed Actions overview with filters for pending, upcoming, and completed items.
 */
export function ActionsOverview() {
  const { t } = useTranslation("actions");
  const { data: actions } = useSuspenseQuery(
    orpc.actions.list.queryOptions({
      input: {},
    })
  );

  const tabDefinitions = useMemo<TabWithCount[]>(() => {
    return BASE_TABS.map((tab) => {
      const labelKey = `tabs.${tab.id}` as const;

      return {
        ...tab,
        label: t(labelKey),
        count: countByStatuses(actions, tab.statuses),
      };
    });
  }, [actions, t]);

  const [activeTab, setActiveTab] = useState<TabId>("pending");

  const isTabId = useCallback((value: string): value is TabId => {
    return (TAB_IDS as readonly string[]).includes(value);
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      if (isTabId(value)) {
        setActiveTab(value);
      }
    },
    [isTabId]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="mt-6 flex flex-col gap-4"
    >
      <TabsList>
        {tabDefinitions.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
            <span>{tab.label}</span>
            <Badge variant="secondary">{tab.count}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabDefinitions.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-4">
          <ActionsTable
            tableId={tab.id}
            actions={actions}
            statuses={tab.statuses}
            defaultSorting={tab.defaultSorting}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
