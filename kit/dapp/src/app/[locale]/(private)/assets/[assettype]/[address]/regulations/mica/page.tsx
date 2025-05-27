import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { MicaRegulationLayout } from "./_components/layout";

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
    console.error("MiCA regulation config not found");
    return null;
  }

  const assetDetails = await getAssetUsersDetail({ address });

  return (
    <div className="space-y-8">
      <MicaRegulationLayout
        config={regulationData.mica_regulation_config}
        assetDetails={assetDetails}
      />
    </div>
  );
}
