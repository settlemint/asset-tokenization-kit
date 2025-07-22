import { updateOnboardingStateMachine } from "@/components/onboarding/state-machine";
import { Welcome } from "@/components/onboarding/welcome";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/")({
  loader: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery(orpc.user.me.queryOptions());
    return updateOnboardingStateMachine({ user });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { steps } = Route.useLoaderData();

  return <Welcome steps={steps} />;
}
