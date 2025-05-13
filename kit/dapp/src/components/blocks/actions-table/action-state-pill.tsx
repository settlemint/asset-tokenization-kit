import type { badgeVariants } from "@/components/ui/badge";
import type { Action, ActionState } from "@/lib/queries/actions/actions-schema";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { isAfter, isBefore } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, ChevronsRight, Clock, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type ActionStatePillProps = {
  action: Action;
};

interface StatusStyle extends VariantProps<typeof badgeVariants> {
  className: string;
  icon: LucideIcon;
}

export function ActionStatePill({
  action,
}: ActionStatePillProps): ReactElement {
  const t = useTranslations("actions");
  const getStatus = (item: Action): ActionState => {
    if (item.executed) {
      return "COMPLETED";
    }
    const isExpired = action.expiresAt
      ? isBefore(action.expiresAt, new Date().getTime())
      : false;
    if (isExpired) {
      return "EXPIRED";
    }

    const isUpcoming = isAfter(action.activeAt, new Date().getTime());
    if (isUpcoming) {
      return "UPCOMING";
    }

    return "PENDING";
  };

  const status = getStatus(action);

  const statusConfig: Record<ActionState, StatusStyle> = {
    PENDING: {
      variant: "default",
      className: "size-4 text-warning",
      icon: Clock,
    },
    UPCOMING: {
      variant: "default",
      className: "size-4 text-primary",
      icon: ChevronsRight,
    },
    COMPLETED: {
      variant: "default",
      className: "size-4 text-success",
      icon: CheckCircle,
    },
    EXPIRED: {
      variant: "destructive",
      className: "size-4 text-destructive",
      icon: TriangleAlert,
    },
  };

  const currentStatusStyle = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <currentStatusStyle.icon className={cn(currentStatusStyle.className)} />
      {t(`state.${status}`)}
    </div>
  );
}
