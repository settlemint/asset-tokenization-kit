import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export type AvailabilityStatusState =
  | "loading"
  | "error"
  | "unavailable"
  | "available";

interface AvailabilityStatusProps {
  status: AvailabilityStatusState;
  className?: string;
}

export function AvailabilityStatus({
  status,
  className,
}: AvailabilityStatusProps) {
  const { t } = useTranslation("asset-designer");

  // Determine icon, color, and label per status
  const {
    icon: Icon,
    colorClass,
    label,
  } = (() => {
    switch (status) {
      case "loading":
        return {
          icon: Loader2,
          colorClass: "text-muted-foreground",
          label: t("wizard.steps.summary.availability.checking"),
        };
      case "error":
        return {
          icon: AlertCircle,
          colorClass: "text-destructive",
          label: t("wizard.steps.summary.availability.errorDescription"),
        };
      case "unavailable":
        return {
          icon: AlertCircle,
          colorClass: "text-destructive",
          label: t("wizard.steps.summary.availability.unavailableDescription"),
        };
      default:
        return {
          icon: CheckCircle2,
          colorClass: "text-success",
          label: t("wizard.steps.summary.availability.availableDescription"),
        };
    }
  })();

  return (
    <div
      className={cn("flex items-center gap-2 text-sm", colorClass, className)}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("size-4", status === "loading" && "animate-spin")} />
      <span>{label}</span>
    </div>
  );
}
