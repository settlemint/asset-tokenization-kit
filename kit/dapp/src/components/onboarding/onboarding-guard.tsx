import { useMounted } from "@/lib/utils/use-mounted";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type PropsWithChildren, useEffect } from "react";
import {
  type OnboardingType,
  type PlatformOnboardingRequirements,
  determineOnboardingType,
  isPlatformOnboardingComplete,
  isIssuerOnboardingComplete,
  isInvestorOnboardingComplete,
} from "@/lib/types/onboarding";

type OnboardingGuardProps = PropsWithChildren<{
  require: "onboarded" | "not-onboarded" | "platform-onboarded";
  allowedTypes?: OnboardingType[];
}>;

export function OnboardingGuard({
  children,
  require,
  allowedTypes,
}: OnboardingGuardProps) {
  const isMounted = useMounted();
  const navigate = useNavigate();

  // Fetch user data
  const { data: user, isError } = useQuery(orpc.user.me.queryOptions());

  // Check if user queries are still loading
  const userLoading = !user && !isError;

  // Fetch system address from settings
  const { data: systemAddress } = useQuery({
    ...orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } }),
    enabled: !!user,
  });

  // Fetch system details including token factories
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress?.value ?? "" },
    }),
    enabled: !!systemAddress?.value,
  });

  // Determine platform onboarding requirements
  const platformRequirements: PlatformOnboardingRequirements = {
    hasWallet: !!user?.wallet,
    hasSystem: !!systemAddress?.value,
    hasTokenFactories: (systemDetails?.tokenFactories.length ?? 0) > 0,
  };

  // Determine user's onboarding status
  const userHasWallet = !!user?.wallet;
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
          hasWallet: userHasWallet,
          platformOnboardingComplete:
            isPlatformOnboardingComplete(platformRequirements),
        });
      case "investor":
        return isInvestorOnboardingComplete({
          hasWallet: userHasWallet,
          hasIdentity: userHasIdentity,
          platformOnboardingComplete:
            isPlatformOnboardingComplete(platformRequirements),
        });
    }
  })();

  const isPlatformOnboarded =
    isPlatformOnboardingComplete(platformRequirements);
  const isCheckComplete = !userLoading && user !== undefined;

  useEffect(() => {
    if (!isCheckComplete) {
      return;
    }

    // Handle platform-onboarded requirement
    if (require === "platform-onboarded" && !isPlatformOnboarded) {
      // Only admin users can do platform onboarding
      if (userRole !== "admin") {
        void navigate({ to: "/" });
      }
      return;
    }

    // Handle onboarded requirement
    if (require === "onboarded" && !isOnboardingComplete) {
      void navigate({
        to: "/onboarding",
        search: { type: onboardingType },
      });
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
      void navigate({
        to: "/onboarding",
        search: { type: onboardingType },
      });
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
