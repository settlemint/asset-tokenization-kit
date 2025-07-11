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
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, type PropsWithChildren } from "react";

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
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is currently in an onboarding flow (to prevent premature redirects)
  const isInOnboardingFlow = location.pathname.includes("/onboarding/");

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

  // Check if onboarding is complete based on type
  const isOnboardingComplete = (() => {
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
  })();

  const isPlatformOnboarded =
    isPlatformOnboardingComplete(platformRequirements);
  const isCheckComplete =
    !userLoading &&
    user !== undefined &&
    !systemAddressLoading &&
    !systemDetailsLoading;

  useEffect(() => {
    if (!isCheckComplete) {
      return;
    }

    // Handle platform-onboarded requirement
    if (require === "platform-onboarded" && !isPlatformOnboarded) {
      // Only admin users can do platform onboarding
      if (userRole === "admin") {
        void navigate({ to: "/onboarding/platform-new" });
      } else {
        void navigate({ to: "/" });
      }
      return;
    }

    // Handle onboarded requirement
    if (require === "onboarded" && !isOnboardingComplete) {
      // Navigate to specific onboarding route based on type
      switch (onboardingType) {
        case "platform":
          void navigate({ to: "/onboarding/platform-new" });
          break;
        case "issuer":
          void navigate({ to: "/onboarding/issuer" });
          break;
        case "investor":
          void navigate({ to: "/onboarding/investor" });
          break;
        default:
          // Fallback to generic onboarding route if type is unknown
          void navigate({ to: "/onboarding" });
      }
      return;
    }

    // Handle not-onboarded requirement
    // Don't redirect if user is actively in onboarding flow (let them finish naturally)
    if (
      require === "not-onboarded" &&
      isOnboardingComplete &&
      !isInOnboardingFlow
    ) {
      void navigate({ to: "/" });
      return;
    }

    // Check if user is on the correct onboarding type
    if (
      require === "not-onboarded" &&
      allowedTypes &&
      onboardingType &&
      !allowedTypes.includes(onboardingType)
    ) {
      // Navigate to specific onboarding route based on type
      switch (onboardingType) {
        case "platform":
          void navigate({ to: "/onboarding/platform-new" });
          break;
        case "issuer":
          void navigate({ to: "/onboarding/issuer" });
          break;
        case "investor":
          void navigate({ to: "/onboarding/investor" });
          break;
        default:
          // Fallback to generic onboarding route if type is unknown
          void navigate({ to: "/onboarding" });
      }
    }
  }, [
    isCheckComplete,
    isOnboardingComplete,
    isPlatformOnboarded,
    require,
    navigate,
    user,
    onboardingType,
    allowedTypes,
    userRole,
    isInOnboardingFlow,
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
