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

  const circulatingSupply = 1000000; // TODO: Get from API
  const reserveValue = 1000000; // TODO: Get from API
  const reserveRatio = (reserveValue / circulatingSupply) * 100;

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
          lastAuditDate={
            config.lastAuditDate?.toISOString() ?? new Date().toISOString()
          }
          reserveStatus={
            (config.reserveStatus as ReserveComplianceStatus) ??
            ReserveComplianceStatus.PENDING_REVIEW
          }
        />
      </CardContent>
    </Card>
  );
}
