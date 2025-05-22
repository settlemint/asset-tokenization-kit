"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { Address } from "viem";
import { ReserveComposition } from "./_components/reserve-composition";
import { ReserveDetails } from "./_components/reserve-details";
import { ReserveRatio } from "./_components/reserve-ratio";
import { ReserveForm } from "./edit-form/form";

interface ReserveCompositionData {
  bankDeposits: number;
  governmentBonds: number;
  highQualityLiquidAssets: number;
  corporateBonds: number;
  centralBankAssets: number;
  commodities: number;
  otherAssets: number;
}

export function ReserveStatusLayout({
  config,
}: {
  config: MicaRegulationConfig;
}) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const params = useParams<{ address: Address }>();

  const circulatingSupply = 0; // TODO: Get from API
  const reserveValue = 0; // TODO: Get from API
  // If circulatingSupply is 0, we consider the ratio to be 100% since there are no tokens to back
  const reserveRatio =
    circulatingSupply === 0 ? 100 : (reserveValue / circulatingSupply) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t("title")}</CardTitle>
        <ReserveForm address={params.address} />
      </CardHeader>
      <CardContent className="space-y-8">
        <ReserveRatio value={reserveRatio} />
        <ReserveComposition {...config.reserveComposition} />
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
