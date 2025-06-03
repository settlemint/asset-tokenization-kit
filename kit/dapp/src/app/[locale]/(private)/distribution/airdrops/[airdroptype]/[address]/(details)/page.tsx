import { DetailGridSkeleton } from "@/components/blocks/skeleton/detail-grid-skeleton";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{
    locale: Locale;
    airdroptype: AirdropType;
    address: Address;
  }>;
}

export default async function AirdropDetailsPage({ params }: PageProps) {
  const { airdroptype, address } = await params;

  return (
    <>
      <Suspense fallback={<DetailGridSkeleton />}>
        <Details airdroptype={airdroptype} address={address} />
      </Suspense>
    </>
  );
}
