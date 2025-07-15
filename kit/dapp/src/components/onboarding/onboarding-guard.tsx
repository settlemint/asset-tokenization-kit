import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type PropsWithChildren, type ReactNode, useEffect } from "react";

/**
 * Props for the OnboardingGuard component.
 */
type OnboardingGuardProps = PropsWithChildren<{
  /** The onboarding status requirement for accessing the guarded route */
  require?: "onboarded" | "not-onboarded";
}>;

export function OnboardingGuard({
  children,
  require = "onboarded",
}: OnboardingGuardProps): ReactNode {
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery({
    ...orpc.user.me.queryOptions(),
  });

  const isOnboarded = Object.values(user.onboardingState).every((step) => step);

  useEffect(() => {
    const handleNavigation = async () => {
      if (require === "onboarded" && !isOnboarded) {
        await navigate({
          to: "/onboarding",
        });
      } else if (require === "not-onboarded" && isOnboarded) {
        await navigate({
          to: "/",
        });
      }
    };

    void handleNavigation();
  }, [require, isOnboarded, navigate]);

  // Don't render children if we're about to redirect
  if (require === "onboarded" && !isOnboarded) {
    return null;
  }

  if (require === "not-onboarded" && isOnboarded) {
    return null;
  }

  return children;
}
