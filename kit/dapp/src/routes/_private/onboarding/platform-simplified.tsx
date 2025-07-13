import {
  onboardingSteps,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { WelcomeScreen } from "@/components/onboarding/simplified/steps/welcome-screen";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";

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

    updateOnboardingStateMachine(user);

    return { user, systemDetails };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { steps, initialSteps, nextStep, currentStep } =
    useStore(onboardingSteps);

  if (!currentStep) {
    return <WelcomeScreen />;
  }

  return (
    <div>
      <h1>Simplified Onboarding</h1>
      <p>Steps: {steps.join(", ")}</p>
      <p>Initial Steps: {initialSteps.join(", ")}</p>
      <p>Next Step: {nextStep}</p>
      <p>Current Step: {currentStep}</p>
    </div>
  );
}
