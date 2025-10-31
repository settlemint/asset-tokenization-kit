import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserEvent } from "@/orpc/routes/user/routes/user.events.schema";
import { Link } from "@tanstack/react-router";
import { ArrowRight, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LatestEventsCardItem } from "./latest-events-card-item";

interface LatestEventsCardListProps {
  events: UserEvent[];
  emptyMessage?: string;
  emptyDescription?: string;
}

export function LatestEventsCardList({
  events,
  emptyMessage,
  emptyDescription,
}: LatestEventsCardListProps) {
  const { t } = useTranslation("dashboard");

  if (events.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <History className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium">
            {emptyMessage ?? t("widgets.latestEvents.empty")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {emptyDescription ?? t("widgets.latestEvents.emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 pr-4">
          {events.map((event) => (
            <LatestEventsCardItem key={event.id} event={event} />
          ))}
        </div>
      </ScrollArea>
      <Link
        to="/activity"
        className="group flex items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <span>{t("widgets.latestEvents.viewAll")}</span>
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </div>
  );
}
