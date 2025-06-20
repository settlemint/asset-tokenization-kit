import { getUser } from "@/lib/auth/utils";
import { getAssetActivity } from "@/lib/queries/asset-activity/asset-activity";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import { isTokenAdmin } from "@/lib/utils/has-role";
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
  const { address, locale } = await params;
  const user = await getUser();

  const regulationData = await getRegulationDetail({
    assetId: address,
    // regulationType: "mica",
  });

  if (!regulationData?.mica_regulation_config) {
    // This should never happen as we check in asset-tabs.ts, but handle it gracefully
    console.error("MiCA regulation config not found for asset:", address);
    notFound();
  }

  const assetDetails = await getAssetUsersDetail({
    address,
  });

  const [{ burnEventCount = 0n } = {}] = await getAssetActivity({
    assetAddress: address,
  });

  const canEdit = isTokenAdmin(user?.wallet, assetDetails);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div className="md:col-span-2">
        <ComplianceScoreLayout config={regulationData.mica_regulation_config} />
      </div>
      <div className="md:col-span-4">
        <ReserveStatusLayout
          config={regulationData.mica_regulation_config}
          assetDetails={assetDetails}
          canEdit={canEdit}
        />
      </div>
      <div className="md:col-span-2">
        <AuthorizationStatusLayout
          config={regulationData.mica_regulation_config}
          canEdit={canEdit}
        />
      </div>
      <div className="md:col-span-4">
        <DocumentationLayout canEdit={canEdit} />
      </div>
      <div className="md:col-span-3">
        <KycMonitoringLayout locale={locale} />
      </div>
      <div className="md:col-span-3">
        <ConsumerProtectionLayout burnEventCount={burnEventCount} />
      </div>
    </div>
  );
}
