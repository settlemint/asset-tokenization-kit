import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export type ButtonLabels = {
  label?: string;
  submittingLabel?: string;
  processingLabel?: string;
};

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
  labels?: ButtonLabels;
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
  labels = {
    label: 'Send transaction',
    submittingLabel: 'Sending transaction...',
    processingLabel: 'Processing...',
  },
}: FormButtonProps) {
  const {
    formState: { isSubmitting, errors },
  } = useFormContext();
  const isLastStep = currentStep === totalSteps - 1;

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {isLastStep ? labels.submittingLabel : labels.processingLabel}
        </>
      );
    }
    return isLastStep ? labels.label : 'Next';
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
        aria-label={isLastStep ? labels.label : 'Go to next step'}
        className={currentStep === 0 ? 'ml-auto' : ''}
        disabled={isSubmitting || (isLastStep && Object.keys(errors).length > 0)}
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
