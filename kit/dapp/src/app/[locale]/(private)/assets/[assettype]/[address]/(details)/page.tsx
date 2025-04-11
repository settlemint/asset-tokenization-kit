import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { Charts } from "./_components/charts";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;

  return (
    <>
      <Details assettype={assettype} address={address} />
      <Charts assettype={assettype} address={address} />
    </>
  );
}
