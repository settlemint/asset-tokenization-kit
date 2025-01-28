import { Button } from '@/components/ui/button';

export function AssetFormButton({
  currentStep,
  handlePrev,
  isLastStep,
  handleNext,
}: {
  currentStep: number;
  handlePrev: () => void;
  isLastStep: boolean;
  handleNext: () => void;
}) {
  return (
    <div className="mt-8 flex justify-between">
      {currentStep > 0 && (
        <Button type="button" variant="outline" onClick={handlePrev}>
          Previous
        </Button>
      )}

      <div className="ml-auto">
        {isLastStep ? (
          <Button type="submit">Create Asset</Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
