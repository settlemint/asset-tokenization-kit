import { MyAssetsHeader } from "@/app/[locale]/(private)/portfolio/(dashboard)/_components/header/my-assets-header";
import { TransferForm } from "@/app/[locale]/(private)/portfolio/_components/transfer-form/form";
import { ActionsTable } from "@/components/blocks/actions-table/actions-table";
import { AssetDistribution } from "@/components/blocks/charts/assets/asset-distribution";
import MyAssetsTable from "@/components/blocks/my-assets-table/my-assets-table-mini";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { LatestEvents } from "../../assets/(dashboard)/_components/table/latest-events";
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
        button={<TransferForm userAddress={user.wallet} asButton />}
      />
      <MyAssetsHeader locale={locale} user={user} />

      <PageHeader title={t("dashboard.my-assets")} className="mt-8" />

      {/* <Await
        queryOptions={orpc.planet.list.queryOptions({ input: {} as const })}
        error={
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <p className="text-sm font-medium text-destructive">
                Failed to load planets
              </p>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page or contact support if the problem
                persists.
              </p>
            </div>
          </div>
        }
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="space-y-3 text-center">
              <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="text-sm text-muted-foreground">
                Loading planets...
              </p>
            </div>
          </div>
        }
      >
        <Planets />
      </Await> */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AssetDistribution address={user.wallet} />
        <MyAssetsTable
          wallet={user.wallet}
          title={t("dashboard.my-assets")}
          variant="small"
        />
        <TransactionsChart walletAddress={user.wallet} />
      </div>
      <PageHeader title={t("dashboard.my-actions-heading")} className="mt-8" />
      <ActionsTable status="PENDING" type="User" />
      <PageHeader title={t("dashboard.latest-events")} className="mt-8 mb-4" />
      <LatestEvents sender={user.wallet} />
    </>
  );
}
