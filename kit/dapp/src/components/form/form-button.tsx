import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export interface ButtonLabels {
  label?: string;
  submittingLabel?: string;
  processingLabel?: string;
}

/**
 * Props for the AssetFormButton component
 */
interface FormButtonProps {
  /** Current step index in the form (0-based) */
  currentStep: number;
  /** Total steps in the form */
  totalSteps: number;
  /** Handler for navigating to the previous step */
  onPreviousStep: () => void;
  /** Handler for navigating to the next step */
  onNextStep: () => void;
  /** Handler for navigating to the last step */
  onLastStep?: () => void;
  /** Override to explicitly control if this should behave as the last step (for external step management) */
  forceLastStep?: boolean;
  labels?: ButtonLabels;
  hideButtons?: boolean;
  isSecurityDialogOpen?: boolean;
  disablePreviousButton?: boolean;
}

/**
 * Navigation buttons for multi-step asset creation form.
 * Provides Previous/Next navigation and a final Create Asset button.
 */
export function FormButton({
  currentStep,
  onPreviousStep,
  totalSteps,
  onNextStep,
  onLastStep,
  forceLastStep,
  labels = {
    label: undefined,
    submittingLabel: undefined,
    processingLabel: undefined,
  },
  hideButtons = false,
  isSecurityDialogOpen = false,
  disablePreviousButton = false,
}: FormButtonProps) {
  const {
    formState: { isSubmitting, errors },
  } = useFormContext();
  // Allow external control of last step status
  const isLastStep = forceLastStep ?? currentStep === totalSteps - 1;
  const t = useTranslations("components.form.button");
  if (hideButtons) {
    return null;
  }
  const defaultLabels = {
    label: t("send-transaction"),
    submittingLabel: t("sending-transaction"),
    processingLabel: t("processing"),
  };

  const finalLabels = {
    label: labels.label ?? defaultLabels.label,
    submittingLabel: labels.submittingLabel ?? defaultLabels.submittingLabel,
    processingLabel: labels.processingLabel ?? defaultLabels.processingLabel,
  };

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {isLastStep
            ? finalLabels.submittingLabel
            : finalLabels.processingLabel}
        </>
      );
    }
    if (isSecurityDialogOpen) {
      return <Loader2 size={16} className="min-w-20 animate-spin" />;
    }
    return isLastStep ? finalLabels.label : t("next");
  };

  const disabled =
    isSubmitting ||
    (isLastStep &&
      Object.keys(errors).filter((key) => key !== "verificationCode").length >
        0);
  return (
    <div
      className={cn(
        "flex justify-between space-x-4 pt-4",
        disablePreviousButton && "justify-end"
      )}
    >
      {!disablePreviousButton && currentStep > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPreviousStep}
          aria-label={t("previous")}
          disabled={isSubmitting}
        >
          {t("previous")}
        </Button>
      )}

      <Button
        type={isLastStep ? (onLastStep ? "button" : "submit") : "button"}
        variant="default"
        onClick={isLastStep ? onLastStep : onNextStep}
        aria-label={isLastStep ? finalLabels.label : t("next")}
        className={cn(
          currentStep === 0 ? "ml-auto" : "",
          "bg-accent text-accent-foreground shadow-inset"
        )}
        disabled={disabled}
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
