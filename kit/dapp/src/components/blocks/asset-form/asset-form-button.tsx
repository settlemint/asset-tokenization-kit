import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Label for the submit button */
  submitLabel?: string;
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
  isSubmitting = false,
  submitLabel = 'Create Asset',
}: AssetFormButtonProps) {
  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {isLastStep ? 'Creating...' : 'Processing...'}
        </>
      );
    }
    return isLastStep ? submitLabel : 'Next';
  };

  console.log('isSubmitting', isSubmitting);
  console.log('isLastStep', isLastStep);
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
        aria-label={isLastStep ? 'Create asset' : 'Go to next step'}
        className={currentStep === 0 ? 'ml-auto' : ''}
        disabled={isSubmitting}
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
