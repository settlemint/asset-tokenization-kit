import { Badge } from "@/components/ui/badge";
import { Web3TransactionHash } from "@/components/web3/web3-transaction-hash";
import { cn } from "@/lib/utils";
import { formatEventName } from "@/lib/utils/format-event-name";
import { FormatDate } from "@/lib/utils/format-value/format-date";
import type { UserEvent } from "@/orpc/routes/user/routes/user.events.schema";
import { useTranslation } from "react-i18next";
import {
  getEventCategory,
  getEventStatus,
  type EVENT_CONFIG_REGISTRY,
} from "./utils/event-config";

interface LatestEventsCardItemProps {
  event: UserEvent;
}

export function LatestEventsCardItem({ event }: LatestEventsCardItemProps) {
  const { t } = useTranslation("dashboard");

  const category = getEventCategory(
    event.eventName as keyof typeof EVENT_CONFIG_REGISTRY
  );
  const status = getEventStatus(
    event.eventName as keyof typeof EVENT_CONFIG_REGISTRY
  );
  const Icon = status.icon;

  const eventDisplayName =
    t(`widgets.latestEvents.types.${event.eventName}`, {
      defaultValue: event.eventName,
    }) ?? formatEventName(event.eventName);

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="flex size-5 shrink-0 items-center justify-center">
        <Icon className={cn("size-4", status.iconClassName)} aria-hidden />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-sm font-medium">{eventDisplayName}</h4>
            <div className="flex items-center gap-2">
              <Badge variant={category.variant} className="text-xs">
                {t(`widgets.latestEvents.${category.translationKey}`, {
                  defaultValue: category.name,
                })}
              </Badge>
              {event.sender?.id && (
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {t("widgets.latestEvents.by")}{" "}
                  <span className="font-mono">
                    {event.sender.id.slice(0, 5)}...{event.sender.id.slice(-3)}
                  </span>
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              <Web3TransactionHash
                hash={event.transactionHash}
                showFullHash={false}
                copyToClipboard
              />
            </div>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            <FormatDate
              value={event.blockTimestamp}
              options={{ type: "date", dateOptions: { relative: true } }}
            />
          </time>
        </div>
      </div>
    </div>
  );
}
