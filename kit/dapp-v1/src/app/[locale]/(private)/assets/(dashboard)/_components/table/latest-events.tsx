import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";

interface LatestEventsProps {
  sender?: Address;
}

export function LatestEvents({ sender }: LatestEventsProps) {
  const t = useTranslations("admin.dashboard.table");

  return (
    <>
      <Suspense fallback={<DataTableSkeleton />}>
        <AssetEventsTable
          disableToolbarAndPagination={true}
          limit={5}
          sender={sender}
        />
      </Suspense>
      <Link
        prefetch
        href="/assets/activity/events"
        className="mt-4 text-muted-foreground text-sm hover:text-primary"
      >
        {t("latest-events.view-all")}
      </Link>
    </>
  );
}
