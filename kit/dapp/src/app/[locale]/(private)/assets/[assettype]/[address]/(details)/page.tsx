import type { Locale } from "next-intl";
import type { Address } from "viem";
import type { AssetType } from "../../types";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address, locale } = await params;

  return <div>AssetDetailsPage</div>;
}
