import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";

interface PageProps {
  params: { locale: Locale; address: Address; assettype: AssetType };
}

export default async function MicaCompliancePage({ params }: PageProps) {
  // Fetch MICA regulation details
  const regulationDetail = await getRegulationDetail({
    assetId: params.address,
    regulationType: "mica",
  });

  console.log("regulationDetail", regulationDetail);

  return <div className="space-y-8"></div>;
}
