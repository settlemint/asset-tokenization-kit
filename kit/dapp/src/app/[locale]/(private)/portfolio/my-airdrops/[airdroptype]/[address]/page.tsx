import { Details } from "@/app/[locale]/(private)/distribution/airdrops/[airdroptype]/[address]/(details)/_components/details";
import { DetailGridSkeleton } from "@/components/blocks/skeleton/detail-grid-skeleton";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{
    locale: Locale;
    airdroptype: AirdropType;
    address: Address;
  }>;
}

export default async function MyAirdropDetailsPage({ params }: PageProps) {
  const { airdroptype, address } = await params;

  return (
    <>
      <Suspense fallback={<DetailGridSkeleton />}>
        <Details airdroptype={airdroptype} address={address} />
      </Suspense>
    </>
  );
}
