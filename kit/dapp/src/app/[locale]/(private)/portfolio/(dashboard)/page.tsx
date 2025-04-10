import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table-mini";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";
import { LatestEvents } from "../../assets/(dashboard)/_components/table/latest-events";
import { Greeting } from "./_components/greeting/greeting";
import { MyAssetsHeader } from "./_components/header/my-assets-header";
import { TransactionsChart } from "./_components/transactions-chart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio",
  });

  return {
    title: {
      ...metadata.title,
      default: t("dashboard.page-title"),
    },
    description: t("dashboard.portfolio-management"),
  };
}

export default async function PortfolioDashboard({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, user] = await Promise.all([
    getTranslations({
      locale,
      namespace: "portfolio",
    }),
    getUser(),
  ]);

  return (
    <>
      <PageHeader
        title={t("dashboard.page-title")}
        section={t("dashboard.portfolio-management")}
      />
      <div className="space-y-4">
        <Greeting />
        <Suspense fallback={<Skeleton className="h-full w-full bg-muted/50" />}>
          <MyAssetsHeader locale={locale} walletAddress={user.wallet} />
        </Suspense>
      </div>

      <PageHeader title={t("dashboard.my-assets")} className="mt-8" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<Skeleton className="h-full w-full bg-muted/50" />}>
          <AssetDistribution address={user.wallet} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-full w-full bg-muted/50" />}>
          <MyAssetsTable
            wallet={user.wallet}
            title={t("dashboard.my-assets")}
            variant="small"
          />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-full w-full bg-muted/50" />}>
          <TransactionsChart walletAddress={user.wallet} />
        </Suspense>
      </div>
      <PageHeader title={t("dashboard.latest-events")} className="mt-8 mb-4" />
      <LatestEvents sender={user.wallet as Address} />
    </>
  );
}
