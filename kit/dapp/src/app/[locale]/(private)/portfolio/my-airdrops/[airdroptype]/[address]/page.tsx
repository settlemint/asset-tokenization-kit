import { DetailGridSkeleton } from "@/components/blocks/skeleton/detail-grid-skeleton";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";
import { MyAirdropDetails } from "./_components/details/details";

interface PageProps {
  params: Promise<{
    locale: Locale;
    address: Address;
    airdroptype: AirdropType;
  }>;
}

export default async function MyAirdropDetailsPage({ params }: PageProps) {
  const { address, airdroptype } = await params;

  return (
    <>
      <Suspense fallback={<DetailGridSkeleton />}>
        <MyAirdropDetails address={address} type={airdroptype} />
      </Suspense>
    </>
  );
}
