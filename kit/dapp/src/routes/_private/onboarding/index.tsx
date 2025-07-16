import { updateOnboardingStateMachine } from "@/components/onboarding/state-machine";
import { Welcome } from "@/components/onboarding/welcome";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/")({
  loader: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });

    // Check if a system exists AND is fully bootstrapped
    let hasSystem = false;
    try {
      const [systemAddress, bootstrapComplete] = await Promise.all([
        queryClient.fetchQuery({
          ...orpc.settings.read.queryOptions({
            input: { key: "SYSTEM_ADDRESS" },
          }),
          staleTime: 0,
        }),
        queryClient.fetchQuery({
          ...orpc.settings.read.queryOptions({
            input: { key: "SYSTEM_BOOTSTRAP_COMPLETE" },
          }),
          staleTime: 0,
        }),
      ]);

      const hasSystemAddress = !!(systemAddress && systemAddress.trim() !== "");
      const isBootstrapComplete = bootstrapComplete === "true";
      hasSystem = hasSystemAddress && isBootstrapComplete;
    } catch {
      hasSystem = false;
    }

    return updateOnboardingStateMachine({ user, hasSystem });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { steps } = Route.useLoaderData();

  return <Welcome steps={steps} />;
}
