import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { YieldDetails } from "./_components/details";
import { YieldPeriodTable } from "./_components/period-table";
interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function YieldPage({ params }: PageProps) {
  const { address } = await params;
  const bond = await getBondDetail({ address });
  return (
    <>
      <YieldDetails address={address} />
      <div className="mt-8 mb-4">
        <YieldPeriodTable bond={bond} />
      </div>
    </>
  );
}
