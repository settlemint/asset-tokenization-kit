import { SetYieldScheduleForm } from '@/app/[locale]/(private)/assets/[assettype]/[address]/yield/_components/set-yield-schedule-form/form';
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Locale } from "next-intl";
import { getTranslations } from 'next-intl/server';
import type { Address } from "viem";
import { YieldDetails } from "./_components/details";
import { YieldPeriodTable } from "./_components/period-table";
interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function YieldPage({ params }: PageProps) {
  const { address } = await params;

  // Hardcoded to bond because the other asset types don't have yield
  const bond = await getBondDetail({ address });

  const t = await getTranslations("admin.bonds.yield");

  if (!bond.yieldSchedule) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <h3 className="text-xl font-semibold">{t("no-yield.title")}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {t("no-yield.description")}
        </p>
        <SetYieldScheduleForm address={address} asButton />
      </div>
    );
  }
  return (
    <>
      <YieldDetails address={address} />
      <div className="mt-8 mb-4">
        <YieldPeriodTable bond={bond} />
      </div>
    </>
  );
}
