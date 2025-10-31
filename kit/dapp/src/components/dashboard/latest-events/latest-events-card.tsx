import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { UserEvent } from "@/orpc/routes/user/routes/user.events.schema";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LatestEventsCardList } from "./latest-events-card-list";
import {
  type EVENT_CONFIG_REGISTRY,
  getEventConfig,
} from "./utils/event-config";

interface LatestEventsCardProps {
  events: UserEvent[];
  currentUserAddress?: string;
  hasAdminPermissions: boolean;
  defaultTab?: "all" | "myActions" | "systemEvents";
  className?: string;
}

export function LatestEventsCard({
  events,
  currentUserAddress,
  hasAdminPermissions,
  defaultTab = "all",
  className,
}: LatestEventsCardProps) {
  const { t } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = useState(defaultTab);

  const filteredEvents = useMemo(() => {
    switch (activeTab) {
      case "myActions":
        if (!currentUserAddress) return [];
        return events.filter(
          (event) =>
            event.sender?.id?.toLowerCase() === currentUserAddress.toLowerCase()
        );

      case "systemEvents":
        return events.filter((event) => {
          const config = getEventConfig(
            event.eventName as keyof typeof EVENT_CONFIG_REGISTRY
          );
          return config.category === "system";
        });

      default:
        return events;
    }
  }, [events, activeTab, currentUserAddress]);

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="shrink-0">
        <h2 className="text-2xl font-semibold">
          {t("widgets.latestEvents.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("widgets.latestEvents.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as typeof activeTab);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="shrink-0">
            <TabsTrigger value="all">
              {t("widgets.latestEvents.tabs.allActivity")}
            </TabsTrigger>
            <TabsTrigger value="myActions">
              {t("widgets.latestEvents.tabs.myActions")}
            </TabsTrigger>
            {hasAdminPermissions && (
              <TabsTrigger value="systemEvents">
                {t("widgets.latestEvents.tabs.systemEvents")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value="all"
            className="mt-4 flex min-h-0 flex-1 flex-col"
          >
            <LatestEventsCardList events={filteredEvents} />
          </TabsContent>

          <TabsContent
            value="myActions"
            className="mt-4 flex min-h-0 flex-1 flex-col"
          >
            <LatestEventsCardList
              events={filteredEvents}
              emptyMessage={t("widgets.latestEvents.emptyMyActions")}
              emptyDescription={t(
                "widgets.latestEvents.emptyMyActionsDescription"
              )}
            />
          </TabsContent>

          {hasAdminPermissions && (
            <TabsContent
              value="systemEvents"
              className="mt-4 flex min-h-0 flex-1 flex-col"
            >
              <LatestEventsCardList
                events={filteredEvents}
                emptyMessage={t("widgets.latestEvents.emptySystemEvents")}
                emptyDescription={t(
                  "widgets.latestEvents.emptySystemEventsDescription"
                )}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
