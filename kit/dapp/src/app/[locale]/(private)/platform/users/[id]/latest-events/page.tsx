import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getUserDetail } from "@/lib/queries/user/user-detail";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getUser } from "@/lib/auth/utils";
import { getTranslations } from "next-intl/server";

interface LatestTransactionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function LatestEventsPage({
  params,
}: LatestTransactionsPageProps) {
  const { id } = await params;
  const currentUser = await getUser();
  const t = await getTranslations("private.users.latest-events");
  const user = await getUserDetail({ currentUser }, { id });

  return (
    <>
      <AssetEventsTable
        disableToolbarAndPagination={true}
        limit={10}
        sender={user.wallet}
      />
      <Link
        href={`/assets/activity/events?sender=${encodeURIComponent(
          user.wallet
        )}`}
        className="flex justify-end"
      >
        <Button variant="secondary" className="mt-4">
          {t("view-all")}
        </Button>
      </Link>
    </>
  );
}
