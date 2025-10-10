"use client";

import { Badge } from "@/components/ui/badge";
import type { ActionStatus } from "@/orpc/routes/actions/routes/actions.list.schema";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, CheckCircle2, Hourglass, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const STATUS_CONFIG: Record<
  ActionStatus,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: LucideIcon;
  }
> = {
  ACTIVE: {
    variant: "default",
    icon: Hourglass,
  },
  PENDING: {
    variant: "outline",
    icon: CalendarClock,
  },
  EXECUTED: {
    variant: "secondary",
    icon: CheckCircle2,
  },
  EXPIRED: {
    variant: "destructive",
    icon: XCircle,
  },
};

interface ActionStatusBadgeProps {
  status: ActionStatus;
}

/**
 * Displays a consistent badge for action statuses with localized labels.
 */
export function ActionStatusBadge({ status }: ActionStatusBadgeProps) {
  const { t } = useTranslation("actions");
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="justify-start">
      <Icon className="size-3" />
      {t(`status.${status}`, { defaultValue: status })}
    </Badge>
  );
}
