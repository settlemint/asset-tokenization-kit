"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { Address } from "viem";
import { ReserveComposition } from "./components/reserve-composition";
import { ReserveDetails } from "./components/reserve-details";
import { ReserveRatio } from "./components/reserve-ratio";
import { ReserveForm } from "./edit-form/form";

// Mock data - replace with actual data fetching
const mockData = {
  reserveRatio: {
    value: 105,
    circulatingSupply: 10000000,
    reserveValue: 10500000,
  },
  composition: {
    bankDeposits: 35,
    governmentBonds: 25,
    liquidAssets: 20,
    corporateBonds: 10,
    centralBankAssets: 5,
    commodities: 3,
    otherAssets: 2,
  },
  audit: {
    lastAuditDate: new Date().toISOString(),
    reserveStatus: "compliant" as const,
  },
};

export function ReserveStatusLayout() {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const params = useParams<{ address: Address }>();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Reserve status</CardTitle>
        <ReserveForm address={params.address} />
      </CardHeader>
      <CardContent className="space-y-8">
        <ReserveRatio {...mockData.reserveRatio} />
        <ReserveComposition {...mockData.composition} />
        <ReserveDetails {...mockData.audit} />
      </CardContent>
    </Card>
  );
}
