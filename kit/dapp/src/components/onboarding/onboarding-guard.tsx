import { authClient } from "@/lib/auth/auth.client";
import {
  determineOnboardingType,
  isInvestorOnboardingComplete,
  isIssuerOnboardingComplete,
  isPlatformOnboardingComplete,
  type OnboardingType,
  type PlatformOnboardingRequirements,
} from "@/lib/types/onboarding";
import { useMounted } from "@/lib/utils/use-mounted";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, type PropsWithChildren } from "react";

type OnboardingGuardProps = PropsWithChildren<{
  require: "onboarded" | "not-onboarded" | "platform-onboarded";
  allowedTypes?: OnboardingType[];
}>;

/**
 * Guards routes based on onboarding status requirements
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if guard passes
 * @param {"onboarded" | "not-onboarded" | "platform-onboarded"} props.require - Onboarding status requirement
 * @param {Array<import("@/lib/types/onboarding").OnboardingType>} [props.allowedTypes] - Allowed onboarding types for this route
 * @returns {JSX.Element | null} Child components if guard passes, null otherwise
 */
export function OnboardingGuard({
  children,
  require,
  allowedTypes,
}: OnboardingGuardProps) {
  const isMounted = useMounted();
  const navigate = useNavigate();

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
  const userRole =
    (user?.role as undefined | "issuer" | "investor" | "admin") ?? "investor";

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
        void navigate({ to: "/onboarding/platform" });
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
          void navigate({ to: "/onboarding/platform" });
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
    if (require === "not-onboarded" && isOnboardingComplete) {
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
          void navigate({ to: "/onboarding/platform" });
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
