import type { Locale } from "next-intl";
import type { Address } from "viem";
import { YieldDetails } from "./_components/details";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function YieldPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <YieldDetails address={address} />
    </>
  );
}
