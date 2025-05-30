import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { AuthorizationStatusLayout } from "./authorization-status/layout";
import { ComplianceScoreLayout } from "./compliance-score/layout";
import { ConsumerProtectionLayout } from "./consumer-protection/layout";
import { DocumentationLayout } from "./documentation/layout";
import { KycMonitoringLayout } from "./kyc-monitoring/layout";
import { ReserveStatusLayout } from "./reserve-status/layout";

export async function MicaRegulationLayout({
  params,
}: {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}) {
  const { address } = await params;

  const regulationData = await getRegulationDetail({
    assetId: address,
    regulationType: "mica",
  });

  if (!regulationData?.mica_regulation_config) {
    // This should never happen as we check in asset-tabs.ts, but handle it gracefully
    console.error("MiCA regulation config not found for asset:", address);
    notFound();
  }

  const assetDetails = await getAssetUsersDetail({
    address,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div className="md:col-span-2">
        <ComplianceScoreLayout />
      </div>
      <div className="md:col-span-4">
        <ReserveStatusLayout
          config={regulationData.mica_regulation_config}
          assetDetails={assetDetails}
        />
      </div>
      <div className="md:col-span-2">
        <AuthorizationStatusLayout
          config={regulationData.mica_regulation_config}
        />
      </div>
      <div className="md:col-span-4">
        <DocumentationLayout />
      </div>
      <div className="md:col-span-3">
        <KycMonitoringLayout />
      </div>
      <div className="md:col-span-3">
        <ConsumerProtectionLayout />
      </div>
    </div>
  );
}
