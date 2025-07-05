import { ActionsTable } from "@/components/blocks/actions-table/actions-table";
import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AssetActivity } from "./_components/charts/asset-activity";
import { AssetActivitySkeleton } from "./_components/charts/asset-activity-skeleton";
import { AssetsSupply } from "./_components/charts/assets-supply";
import { AssetsSupplySkeleton } from "./_components/charts/assets-supply-skeleton";
import { TransactionsHistory } from "./_components/charts/transactions-history";
import { TransactionsHistorySkeleton } from "./_components/charts/transactions-history-skeleton";
import { UsersHistory } from "./_components/charts/users-history";
import { UsersHistorySkeleton } from "./_components/charts/users-history-skeleton";
import { LatestEvents } from "./_components/table/latest-events";
import { AssetsWidget } from "./_components/widgets/assets";
import { PriceWidget } from "./_components/widgets/price";
import { TransactionsWidget } from "./_components/widgets/transactions";
import { UsersWidget } from "./_components/widgets/users";
import { WidgetSkeleton } from "./_components/widgets/widget-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.dashboard.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("description"),
  };
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.dashboard.page",
  });

  return (
    <>
      <PageHeader title={t("title")} section={t("asset-management")} />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <Suspense fallback={<WidgetSkeleton />}>
          <AssetsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <TransactionsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <UsersWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <PriceWidget />
        </Suspense>
      </div>
      <p className="mt-8 mb-4 text-2xl">{t("stats-heading")}</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0 2xl:grid-cols-4">
        <Suspense fallback={<AssetsSupplySkeleton />}>
          <AssetsSupply />
        </Suspense>
        <Suspense fallback={<AssetActivitySkeleton />}>
          <AssetActivity />
        </Suspense>
        <Suspense fallback={<UsersHistorySkeleton />}>
          <UsersHistory />
        </Suspense>
        <Suspense fallback={<TransactionsHistorySkeleton />}>
          <TransactionsHistory />
        </Suspense>
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">{t("actions-heading")}</p>
      <ActionsTable status="PENDING" type="Admin" />
      <p className="mt-8 mb-4 font-semibold text-2xl">
        {t("latest-events-heading")}
      </p>
      <LatestEvents />
    </>
  );
}
