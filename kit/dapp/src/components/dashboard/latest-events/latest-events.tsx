import { LatestEventsCard } from "@/components/dashboard/latest-events/latest-events-card";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

interface LatestEventsProps {
  className?: string;
}

export function LatestEvents({ className }: LatestEventsProps) {
  return (
    <Suspense fallback={<LatestEventsSkeleton />}>
      <LatestEventsContent className={className} />
    </Suspense>
  );
}

const LatestEventsContent = withErrorBoundary(function LatestEventsContent({
  className,
}: LatestEventsProps) {
  const { data: session } = useSession();
  const { data } = useSuspenseQuery(
    orpc.user.events.queryOptions({
      input: { limit: 20 },
    })
  );
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const events = data.events ?? [];

  const hasAdminPermissions = Object.values(
    system.userPermissions?.roles ?? {}
  ).includes(true);

  return (
    <LatestEventsCard
      events={events}
      currentUserAddress={session?.user.wallet}
      hasAdminPermissions={hasAdminPermissions}
      className={className}
    />
  );
});

export function LatestEventsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}
