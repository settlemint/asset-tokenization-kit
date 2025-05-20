import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { MicaRegulationLayout } from "./components/layout";

interface PageProps {
  params: { locale: Locale; address: Address; assettype: AssetType };
}

export default async function MicaRegulationPage({ params }: PageProps) {
  // Fetch MICA regulation details
  const regulationDetail = await getRegulationDetail({
    assetId: params.address,
    regulationType: "mica",
  });

  return (
    <div className="space-y-8">
      <MicaRegulationLayout />
    </div>
  );
}
