import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";
import { orpc } from "@/orpc/orpc-client";
import type { CurrentUser } from "@/orpc/routes/user/routes/user.me.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

import { IdentityProgressCard } from "./identity-progress-card";

interface IdentityProgressProps {
  user: CurrentUser;
}

export function IdentityProgress({ user }: IdentityProgressProps) {
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  return (
    <Suspense fallback={<IdentityProgressSkeleton />}>
      <IdentityProgressContent user={user} systemAddress={systemAddress} />
    </Suspense>
  );
}

interface IdentityProgressContentProps {
  user: CurrentUser;
  systemAddress: string | null | undefined;
}

function IdentityProgressContent({
  user,
  systemAddress,
}: IdentityProgressContentProps) {
  const { t } = useTranslation("onboarding");
  const targetSystemId = systemAddress ?? "default";

  const systemQuery = orpc.system.read.queryOptions({
    input: { id: targetSystemId },
  });

  const { data: systemDetails } = useSuspenseQuery(systemQuery);

  const identityRegistered = !!systemDetails?.userIdentity?.registered;
  const personalInfoCompleted = user.onboardingState.identity;

  if (identityRegistered) {
    return null;
  }

  const steps = [
    {
      id: "personal-info",
      title: t("identityProgress.steps.personalInfo.title"),
      description: t("identityProgress.steps.personalInfo.description"),
      completed: personalInfoCompleted,
    },
    {
      id: "registry",
      title: t("identityProgress.steps.registry.title"),
      description: t("identityProgress.steps.registry.description"),
      completed: identityRegistered,
    },
  ];

  return (
    <IdentityProgressCard
      title={t("identityProgress.title")}
      description={t("identityProgress.description")}
      steps={steps}
      cta={{
        label: t("identityProgress.cta.label"),
        href: "/onboarding/identity",
      }}
    />
  );
}

export function IdentityProgressSkeleton() {
  return (
    <div className="space-y-8">
      <div className="border-border/60 bg-muted/50 rounded-xl border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="mt-4 h-2 w-full" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="mb-4 rounded-lg bg-muted p-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}
