import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { MicaConfigMissing, MicaRegulationLayout } from "./_components";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function MicaRegulationPage({ params }: PageProps) {
  const { address } = await params;

  const regulationData = await getRegulationDetail({
    assetId: address.toLowerCase(),
    regulationType: "mica",
  });

  if (!regulationData?.mica_regulation_config) {
    console.error("MiCA regulation config not found for asset:", address);
    return <MicaConfigMissing assetAddress={address} />;
  }

  return (
    <div className="space-y-8">
      <MicaRegulationLayout />
    </div>
  );
}
