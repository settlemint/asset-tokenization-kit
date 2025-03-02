import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function LatestEvents() {
  const t = useTranslations("admin.dashboard.table");

  return (
    <>
      <AssetEventsTable disableToolbarAndPagination={true} limit={5} />
      <Link
        href="/admin/activity/events"
        className="mt-4 text-muted-foreground text-sm hover:text-primary"
      >
        {t("latest-events.view-all")}
      </Link>
    </>
  );
}
