import { orpc } from "@/orpc";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type PropsWithChildren, useEffect } from "react";

type OnboardingGuardProps = PropsWithChildren<{
  require: "onboarded" | "not-onboarded";
}>;

export function OnboardingGuard({ children, require }: OnboardingGuardProps) {
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  const {
    data: account,
    isSuccess,
    isLoading,
  } = useQuery({
    ...orpc.account.me.queryOptions(),
    enabled: !!user.wallet,
  });

  const hasWallet = !!user.wallet;
  const hasCountry = isSuccess && account.country !== undefined;
  const isOnboarded = hasWallet && hasCountry;

  const isCheckComplete = !hasWallet || !isLoading;

  useEffect(() => {
    if (!isCheckComplete) {
      return;
    }

    if (require === "onboarded" && !isOnboarded) {
      void navigate({ to: "/onboarding" });
    }
    if (require === "not-onboarded" && isOnboarded) {
      void navigate({ to: "/" });
    }
  }, [isCheckComplete, isOnboarded, require, navigate]);

  if (!isCheckComplete) {
    return null;
  }

  if (require === "onboarded" && isOnboarded) {
    return <>{children}</>;
  }

  if (require === "not-onboarded" && !isOnboarded) {
    return <>{children}</>;
  }

  return null;
}
