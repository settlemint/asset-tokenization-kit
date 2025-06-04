import { DetailGridSkeleton } from "@/components/blocks/skeleton/detail-grid-skeleton";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";
import { MyAirdropDetails } from "./_components/details/details";

interface PageProps {
  params: Promise<{
    locale: Locale;
    address: Address;
  }>;
}

export default async function MyAirdropDetailsPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <Suspense fallback={<DetailGridSkeleton />}>
        <MyAirdropDetails address={address} />
      </Suspense>
    </>
  );
}
