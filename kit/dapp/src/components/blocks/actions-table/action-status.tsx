import type { badgeVariants } from "@/components/ui/badge";
import { calculateActionStatus } from "@/lib/queries/actions/action-status";
import type {
  Action,
  ActionStatus,
} from "@/lib/queries/actions/actions-schema";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, ChevronsRight, Clock, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type ActionStatusIndicatorProps = {
  action: Action;
};

interface StatusStyle extends VariantProps<typeof badgeVariants> {
  className: string;
  icon: LucideIcon;
}

export function ActionStatusIndicator({
  action,
}: ActionStatusIndicatorProps): ReactElement {
  const t = useTranslations("actions");

  const status = calculateActionStatus(action);

  const statusConfig: Record<ActionStatus, StatusStyle> = {
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
      {t(`status.${status}`)}
    </div>
  );
}
