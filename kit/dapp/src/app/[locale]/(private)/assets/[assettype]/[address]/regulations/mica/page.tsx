import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import { normalizeAddress } from "@/lib/utils/typebox/address";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { MicaRegulationLayout } from "./_components/layout";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function MicaRegulationPage({ params }: PageProps) {
  const { address } = await params;

  // Normalize the address to lowercase for consistency while maintaining the Address type
  const normalizedAddress = normalizeAddress(address);

  const regulationData = await getRegulationDetail({
    assetId: normalizedAddress,
    regulationType: "mica",
  });

  if (!regulationData?.mica_regulation_config) {
    // This should never happen as we check in asset-tabs.ts, but handle it gracefully
    console.error(
      "MiCA regulation config not found for asset:",
      normalizedAddress
    );
    notFound();
  }

  const assetDetails = await getAssetUsersDetail({
    address: normalizedAddress,
  });

  return (
    <div className="space-y-8">
      <MicaRegulationLayout
        config={regulationData.mica_regulation_config}
        assetDetails={assetDetails}
      />
    </div>
  );
}
