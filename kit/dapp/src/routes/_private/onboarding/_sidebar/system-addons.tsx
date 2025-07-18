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
  "/_private/onboarding/_sidebar/system-addons"
)({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAddons),
  component: RouteComponent,
});

function RouteComponent() {
  const { navigateToStep, completeStepAndNavigate } = useOnboardingNavigation();

  const onNext = () =>
    void completeStepAndNavigate(OnboardingStep.systemAddons);
  const onPrevious = () => void navigateToStep(OnboardingStep.systemAssets);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Enable Addons</h2>
        <p className="text-sm text-muted-foreground pt-2">
          Enable additional features and integrations for your platform
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">
            Platform addons configuration will be implemented here.
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
