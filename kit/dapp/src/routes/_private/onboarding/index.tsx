import {
  determineOnboardingType,
  type PlatformOnboardingRequirements,
} from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    // Fetch user and system address data in parallel
    const [user, systemAddress] = await Promise.all([
      queryClient.ensureQueryData(orpc.user.me.queryOptions()),
      queryClient.ensureQueryData(
        orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
      ),
    ]);

    // User is guaranteed to exist in _private routes due to auth middleware

    let systemDetails = null;
    if (systemAddress) {
      systemDetails = await queryClient.ensureQueryData(
        orpc.system.read.queryOptions({
          input: { id: systemAddress },
        })
      );
    }

    // Determine platform onboarding requirements
    const platformRequirements: PlatformOnboardingRequirements = {
      hasWallet: !!user.wallet,
      hasSystem: !!systemAddress,
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
