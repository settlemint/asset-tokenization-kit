import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export type ButtonLabels = {
  label?: string;
  submittingLabel?: string;
  processingLabel?: string;
};

/**
 * Props for the AssetFormButton component
 */
interface AssetFormButtonProps {
  /** Current step index in the form (0-based) */
  currentStep: number;
  /** Handler for navigating to the previous step */
  onPreviousStep: () => void;
  /** Whether this is the final step in the form */
  isLastStep: boolean;
  /** Handler for navigating to the next step */
  onNextStep: () => void;
  /** Whether the form has errors */
  hasErrors: boolean;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  button?: ButtonLabels;
}

/**
 * Navigation buttons for multi-step asset creation form.
 * Provides Previous/Next navigation and a final Create Asset button.
 */
export function AssetFormButton({
  currentStep,
  onPreviousStep,
  isLastStep,
  onNextStep,
  hasErrors,
  isSubmitting = false,
  button = {
    label: 'Send transaction',
    submittingLabel: 'Sending transaction...',
    processingLabel: 'Processing...',
  },
}: AssetFormButtonProps) {
  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {isLastStep ? button.submittingLabel : button.processingLabel}
        </>
      );
    }
    return isLastStep ? button.label : 'Next';
  };

  return (
    <div className="flex justify-between space-x-4 pt-4">
      {currentStep > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPreviousStep}
          aria-label="Go to previous step"
          disabled={isSubmitting}
        >
          Previous
        </Button>
      )}

      <Button
        type={isLastStep ? 'submit' : 'button'}
        variant="default"
        onClick={isLastStep ? undefined : onNextStep}
        aria-label={isLastStep ? button.label : 'Go to next step'}
        className={currentStep === 0 ? 'ml-auto' : ''}
        disabled={isSubmitting || (isLastStep && hasErrors)}
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
