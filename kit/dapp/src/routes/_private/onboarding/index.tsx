import { createFileRoute, redirect } from "@tanstack/react-router";
import { orpc } from "@/orpc";
import {
  determineOnboardingType,
  type PlatformOnboardingRequirements,
} from "@/lib/types/onboarding";

export const Route = createFileRoute("/_private/onboarding/")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    // Fetch user data
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());

    // User is guaranteed to exist in _private routes due to auth middleware

    // Fetch system data to determine platform status
    const systemAddress = await queryClient.ensureQueryData(
      orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
    );

    let systemDetails = null;
    if (systemAddress?.value) {
      systemDetails = await queryClient.ensureQueryData(
        orpc.system.read.queryOptions({
          input: { id: systemAddress.value },
        })
      );
    }

    // Determine platform onboarding requirements
    const platformRequirements: PlatformOnboardingRequirements = {
      hasWallet: !!user.wallet,
      hasSystem: !!systemAddress?.value,
      hasTokenFactories: (systemDetails?.tokenFactories.length ?? 0) > 0,
    };

    // Determine onboarding type and redirect
    const onboardingType = determineOnboardingType(
      user.role,
      platformRequirements
    );

    throw redirect({
      to: `/onboarding/${onboardingType}`,
      replace: true,
    });
  },
  component: () => null, // This route only redirects
});
