import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { Welcome } from "@/components/onboarding/welcome";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(),
  component: RouteComponent,
});

function RouteComponent() {
  const { steps } = Route.useRouteContext();

  return <Welcome steps={steps} />;
}
