import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { MicaRegulationLayout } from "./_components/layout";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function MicaRegulationPage({ params }: PageProps) {
  return (
    <div className="space-y-8">
      <MicaRegulationLayout params={params} />
    </div>
  );
}
