"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import type { AssetUsers } from "@/lib/queries/asset/asset-users-schema";
import { isTokenAdmin } from "@/lib/utils/has-role";
import { useTranslations } from "next-intl";
import { ReserveComposition } from "./_components/reserve-composition";
import { ReserveDetails } from "./_components/reserve-details";
import { ReserveRatio } from "./_components/reserve-ratio";
import { ReserveForm } from "./edit-form/form";

export function ReserveStatusLayout({
  config,
  assetDetails,
}: {
  config: MicaRegulationConfig;
  assetDetails: AssetUsers;
}) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const { data: session } = authClient.useSession();

  const circulatingSupply = assetDetails.totalSupply
    ? Number(assetDetails.totalSupply)
    : 0;
  const reserveValue = assetDetails.collateral
    ? Number(assetDetails.collateral)
    : 0;
  // If circulatingSupply is 0, we consider the ratio to be 100% since there are no tokens to back
  const reserveRatio =
    circulatingSupply === 0
      ? 100
      : Number(((reserveValue / circulatingSupply) * 100).toFixed(1));

  const canEditReserve = isTokenAdmin(session?.user?.wallet, assetDetails);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t("title")}</CardTitle>
        {canEditReserve && (
          <ReserveForm address={assetDetails.id} config={config} />
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <ReserveRatio value={reserveRatio} />
        <ReserveComposition {...(config.reserveComposition || {})} />
        <ReserveDetails
          circulatingSupply={circulatingSupply}
          reserveValue={reserveValue}
          lastAuditDate={config.lastAuditDate?.toISOString()}
          reserveStatus={config.reserveStatus as ReserveComplianceStatus}
        />
      </CardContent>
    </Card>
  );
}
