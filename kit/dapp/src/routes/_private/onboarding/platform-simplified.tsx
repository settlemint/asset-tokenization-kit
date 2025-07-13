import {
  OnboardingStep,
  onboardingSteps,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { WelcomeScreen } from "@/components/onboarding/simplified/steps/welcome-screen";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/platform-simplified"
)({
  loader: async ({ context: { orpc, queryClient } }) => {
    // Load user and system address in parallel
    const [user, systemAddress] = await Promise.all([
      queryClient.ensureQueryData(orpc.user.me.queryOptions()),
      queryClient.ensureQueryData(
        orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
      ),
    ]);

    // If we have a system address, ensure system details are loaded
    let systemDetails = null;
    if (systemAddress) {
      systemDetails = await queryClient.ensureQueryData(
        orpc.system.read.queryOptions({
          input: { id: systemAddress },
        })
      );
    }

    updateOnboardingStateMachine({ user });

    return { user, systemDetails };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const steps = useStore(onboardingSteps);
  logger.warn("steps", { steps });
  const currentStep = steps.find((step) => step.current);

  switch (currentStep?.step) {
    case OnboardingStep.welcome:
      return <WelcomeScreen />;
    default:
      return <div>Unknown step</div>;
  }
}
