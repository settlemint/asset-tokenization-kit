import { LatestEventsTable } from "@/components/dashboard/latest-events/latest-events-table";
import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export function LatestEvents() {
  const { t } = useTranslation("dashboard");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <SectionTitle>{t("widgets.latestEvents.title")}</SectionTitle>
          <SectionSubtitle>
            {t("widgets.latestEvents.subtitle", {
              defaultValue: t("widgets.latestEvents.emptyDescription"),
            })}
          </SectionSubtitle>
        </div>
        {/* <Button variant="ghost" size="sm" disabled>
          {t("widgets.latestEvents.viewAll")}
        </Button> */}
      </div>

      <Suspense fallback={<LatestEventsSkeleton />}>
        <ComponentErrorBoundary componentName="Latest Events">
          <LatestEventsContent />
        </ComponentErrorBoundary>
      </Suspense>
    </div>
  );
}

function LatestEventsContent() {
  const { data } = useSuspenseQuery(
    orpc.user.events.queryOptions({
      input: { limit: 5 },
    })
  );

  const events = data.events ?? [];

  return <LatestEventsTable events={events} />;
}

export function LatestEventsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}
