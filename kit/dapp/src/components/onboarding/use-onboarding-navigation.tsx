import type { OnboardingType } from "@/lib/types/onboarding";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Custom hook to handle onboarding navigation logic
 */
export function useOnboardingNavigation() {
  const navigate = useNavigate();

  const navigateToOnboarding = useCallback(
    (type: OnboardingType | null) => {
      switch (type) {
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
          void navigate({ to: "/onboarding" });
      }
    },
    [navigate]
  );

  const navigateHome = useCallback(() => {
    void navigate({ to: "/" });
  }, [navigate]);

  return {
    navigateToOnboarding,
    navigateHome,
  };
}

/**
 * Determines if navigation is required based on onboarding state
 */
export function deriveNavigationRequirement({
  require,
  isOnboardingComplete,
  isPlatformOnboarded,
  userRole,
  onboardingType,
  allowedTypes,
}: {
  require: "onboarded" | "not-onboarded" | "platform-onboarded";
  isOnboardingComplete: boolean;
  isPlatformOnboarded: boolean;
  userRole: string;
  onboardingType: OnboardingType | null;
  allowedTypes?: OnboardingType[];
}) {
  // Handle platform-onboarded requirement
  if (require === "platform-onboarded" && !isPlatformOnboarded) {
    return {
      shouldNavigate: true,
      navigateTo: userRole === "admin" ? "platform" : "home",
    };
  }

  // Handle onboarded requirement
  if (require === "onboarded" && !isOnboardingComplete) {
    return {
      shouldNavigate: true,
      navigateTo: onboardingType,
    };
  }

  // Handle not-onboarded requirement
  if (require === "not-onboarded" && isOnboardingComplete) {
    return {
      shouldNavigate: true,
      navigateTo: "home",
    };
  }

  // Check if user is on the correct onboarding type
  if (
    require === "not-onboarded" &&
    allowedTypes &&
    onboardingType &&
    !allowedTypes.includes(onboardingType)
  ) {
    return {
      shouldNavigate: true,
      navigateTo: onboardingType,
    };
  }

  return {
    shouldNavigate: false,
    navigateTo: null,
  };
}
