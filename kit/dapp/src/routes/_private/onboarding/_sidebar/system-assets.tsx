import { AssetDeployment } from "@/components/onboarding/assets/asset-deployment";
import { AssetTypeSelection } from "@/components/onboarding/assets/asset-type-selection";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-assets"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAssets),
  component: SystemAssetsComponent,
});

function SystemAssetsComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.systemAssets) {
    return <AssetTypeSelection />;
  }

  return <AssetDeployment />;
}
