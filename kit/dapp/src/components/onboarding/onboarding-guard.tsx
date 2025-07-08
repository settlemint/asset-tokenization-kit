/**
 * Onboarding guard component for route protection based on user onboarding status.
 *
 * This component acts as a route guard that ensures users are in the correct onboarding
 * state before accessing certain routes. It checks:
 * - Platform onboarding status (system setup, token factories)
 * - User onboarding status (profile completion)
 * - User role-specific requirements (admin, issuer, investor)
 *
 * The guard automatically redirects users to the appropriate onboarding flow based on
 * their role and current onboarding progress.
 *
 * @module components/onboarding/onboarding-guard
 */

import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth.client";
import {
  determineOnboardingType,
  isInvestorOnboardingComplete,
  isIssuerOnboardingComplete,
  isPlatformOnboardingComplete,
  type OnboardingType,
  type PlatformOnboardingRequirements,
} from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type PropsWithChildren } from "react";
import {
  useOnboardingNavigation,
  deriveNavigationRequirement,
} from "./use-onboarding-navigation";

/**
 * Props for the OnboardingGuard component.
 */
type OnboardingGuardProps = PropsWithChildren<{
  /** The onboarding status requirement for accessing the guarded route */
  require: "onboarded" | "not-onboarded" | "platform-onboarded";
  /** Optional array of allowed onboarding types for the route */
  allowedTypes?: OnboardingType[];
}>;

/**
 * OnboardingGuard component that protects routes based on onboarding requirements.
 *
 * This component performs comprehensive checks to ensure users are in the correct
 * onboarding state before allowing access to protected routes. It handles three
 * main requirements:
 *
 * 1. **"onboarded"** - User must have completed their full onboarding process
 * 2. **"not-onboarded"** - User must not have completed onboarding (for onboarding routes)
 * 3. **"platform-onboarded"** - Platform must be set up (admin only)
 *
 * The component automatically determines the user's onboarding type based on their
 * role and redirects them to the appropriate onboarding flow if requirements aren't met.
 *
 * @param {OnboardingGuardProps} props - Component configuration
 * @param {React.ReactNode} props.children - Child components to render when guard passes
 * @param {"onboarded" | "not-onboarded" | "platform-onboarded"} props.require - The onboarding requirement
 * @param {OnboardingType[]} [props.allowedTypes] - Specific onboarding types allowed for this route
 * @returns {JSX.Element | null} Children if requirements are met, null otherwise
 *
 * @example
 * // Protect a route that requires onboarding completion
 * <OnboardingGuard require="onboarded">
 *   <Dashboard />
 * </OnboardingGuard>
 *
 * @example
 * // Protect onboarding routes from already-onboarded users
 * <OnboardingGuard require="not-onboarded" allowedTypes={["issuer"]}>
 *   <IssuerOnboardingFlow />
 * </OnboardingGuard>
 *
 * @example
 * // Admin-only platform setup routes
 * <OnboardingGuard require="platform-onboarded">
 *   <SystemConfiguration />
 * </OnboardingGuard>
 */
export function OnboardingGuard({
  children,
  require,
  allowedTypes,
}: OnboardingGuardProps) {
  const isMounted = useMounted();
  const { navigateToOnboarding, navigateHome } = useOnboardingNavigation();

  // Fetch user data
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Check if user queries are still loading
  const userLoading = isPending;

  // Fetch system address from settings
  const { data: systemAddress, isLoading: systemAddressLoading } = useQuery({
    ...orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } }),
    enabled: !!user,
  });

  // Fetch system details including token factories
  const { data: systemDetails, isLoading: systemDetailsLoading } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  // Determine platform onboarding requirements
  const platformRequirements: PlatformOnboardingRequirements = {
    userOnboarded: !!user?.isOnboarded,
    hasSystem: !!systemAddress,
    hasTokenFactories: (systemDetails?.tokenFactories.length ?? 0) > 0,
  };

  // Determine user's onboarding status
  const userOnboarded = !!user?.isOnboarded;
  const userHasIdentity = false; // TODO: Implement identity check
  const userRole = user?.role ?? "investor";

  const onboardingType = user
    ? determineOnboardingType(userRole, platformRequirements)
    : null;

  // Derive onboarding completion status
  const isOnboardingComplete = deriveIsOnboardingComplete({
    onboardingType,
    user,
    platformRequirements,
    userOnboarded,
    userHasIdentity,
  });

  const isPlatformOnboarded =
    isPlatformOnboardingComplete(platformRequirements);
  const isCheckComplete =
    !userLoading &&
    user !== undefined &&
    !systemAddressLoading &&
    !systemDetailsLoading;

  // Derive navigation requirement
  const navigationRequirement = deriveNavigationRequirement({
    require,
    isOnboardingComplete,
    isPlatformOnboarded,
    userRole,
    onboardingType,
    allowedTypes,
  });

  useEffect(() => {
    if (!isCheckComplete || !navigationRequirement.shouldNavigate) {
      return;
    }

    if (navigationRequirement.navigateTo === "home") {
      navigateHome();
    } else {
      navigateToOnboarding(navigationRequirement.navigateTo);
    }
  }, [
    isCheckComplete,
    navigationRequirement,
    navigateToOnboarding,
    navigateHome,
  ]);

  if (!isMounted || !isCheckComplete) {
    return null;
  }

  // Render children if all checks pass
  if (require === "platform-onboarded" && isPlatformOnboarded) {
    return <>{children}</>;
  }

  if (require === "onboarded" && isOnboardingComplete) {
    return <>{children}</>;
  }

  if (require === "not-onboarded" && !isOnboardingComplete) {
    // Additional check for allowed types
    if (
      !allowedTypes ||
      !onboardingType ||
      allowedTypes.includes(onboardingType)
    ) {
      return <>{children}</>;
    }
  }

  return null;
}

/**
 * Helper function to derive onboarding completion status
 */
function deriveIsOnboardingComplete({
  onboardingType,
  user,
  platformRequirements,
  userOnboarded,
  userHasIdentity,
}: {
  onboardingType: OnboardingType | null;
  user: { role?: string } | null;
  platformRequirements: PlatformOnboardingRequirements;
  userOnboarded: boolean;
  userHasIdentity: boolean;
}): boolean {
  if (!onboardingType || !user) return false;

  switch (onboardingType) {
    case "platform":
      return isPlatformOnboardingComplete(platformRequirements);
    case "issuer":
      return isIssuerOnboardingComplete({
        userOnboarded,
        platformOnboardingComplete:
          isPlatformOnboardingComplete(platformRequirements),
      });
    case "investor":
      return isInvestorOnboardingComplete({
        userOnboarded,
        hasIdentity: userHasIdentity,
        platformOnboardingComplete:
          isPlatformOnboardingComplete(platformRequirements),
      });
  }
}
