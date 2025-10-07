import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
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

  if (status === "loading") {
    return (
      <Alert className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <AlertTitle>
          {t("wizard.steps.summary.availability.checkingTitle")}
        </AlertTitle>
        <AlertDescription>
          {t("wizard.steps.summary.availability.checking")}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTitle>{t("wizard.steps.summary.availability.error")}</AlertTitle>
        <AlertDescription>
          {t("wizard.steps.summary.availability.errorDescription")}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "unavailable") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTitle>
          {t("wizard.steps.summary.availability.unavailable")}
        </AlertTitle>
        <AlertDescription>
          {t("wizard.steps.summary.availability.unavailableDescription")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="default"
      className={cn(
        "border-success bg-success-background text-success",
        className
      )}
    >
      <CheckCircle2 className="text-success" />
      <AlertTitle>
        {t("wizard.steps.summary.availability.available")}
      </AlertTitle>
      <AlertDescription>
        {t("wizard.steps.summary.availability.availableDescription")}
      </AlertDescription>
    </Alert>
  );
}
