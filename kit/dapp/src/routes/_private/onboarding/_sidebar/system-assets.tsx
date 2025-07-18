import { OnboardingStep } from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-assets"
)({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAssets),
  component: RouteComponent,
});

function RouteComponent() {
  const { navigateToStep, completeStepAndNavigate } = useOnboardingNavigation();

  const onNext = () =>
    void completeStepAndNavigate(OnboardingStep.systemAssets);
  const onPrevious = () => void navigateToStep(OnboardingStep.systemSettings);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Select Assets</h2>
        <p className="text-sm text-muted-foreground pt-2">
          Choose which asset types your platform will support
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">
            Asset type selection will be implemented here.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
