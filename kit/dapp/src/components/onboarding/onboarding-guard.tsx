import { useMounted } from "@/lib/utils/use-mounted";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type PropsWithChildren, useEffect } from "react";

type OnboardingGuardProps = PropsWithChildren<{
  require: "onboarded" | "not-onboarded";
}>;

export function OnboardingGuard({ children, require }: OnboardingGuardProps) {
  const isMounted = useMounted();
  const navigate = useNavigate();
  const { data: user, isError } = useQuery(orpc.user.me.queryOptions());

  const {
    data: account,
    isSuccess,
    isLoading,
  } = useQuery({
    ...orpc.account.me.queryOptions(),
    enabled: !!user?.wallet,
  });

  const hasWallet = !!user?.wallet;
  const hasCountry = isSuccess && account?.country !== undefined;
  const isOnboarded = hasWallet && hasCountry;

  const isCheckComplete = (!hasWallet || !isLoading) && !isError;

  useEffect(() => {
    if (!isCheckComplete || !user) {
      return;
    }

    if (require === "onboarded" && !isOnboarded) {
      void navigate({ to: "/onboarding" });
    }
    if (require === "not-onboarded" && isOnboarded) {
      void navigate({ to: "/" });
    }
  }, [isCheckComplete, isOnboarded, require, navigate, user]);

  if (!isMounted || !isCheckComplete) {
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
