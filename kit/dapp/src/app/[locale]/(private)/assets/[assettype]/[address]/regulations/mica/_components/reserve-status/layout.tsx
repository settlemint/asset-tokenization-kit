"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { ReserveComposition } from "./_components/reserve-composition";
import { ReserveDetails } from "./_components/reserve-details";
import { ReserveRatio } from "./_components/reserve-ratio";
import { ReserveForm } from "./edit-form/form";

export function ReserveStatusLayout() {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const params = useParams<{ address: Address }>();
  const [config, setConfig] = useState<MicaRegulationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch regulation config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/regulations/mica/${params.address}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Error fetching regulation config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [params.address]);

  // Helper function to safely format dates
  const getFormattedDate = (dateValue: any): string | null => {
    if (!dateValue) return null;

    try {
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }

      // If it's a string, try to parse it
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }

      return null;
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  // Calculate reserve ratio from composition
  const calculateReserveRatio = (): number => {
    if (!config?.reserveComposition) {
      return 105.3; // Fallback mock ratio
    }

    const composition = config.reserveComposition;
    const total = Object.values(composition).reduce((sum, value) => {
      return sum + (typeof value === "number" ? value : 0);
    }, 0);

    // Convert percentage to ratio (assuming target is 100%, so 105% = 1.053 ratio)
    return total > 0 ? total * 1.053 : 105.3;
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        {isLoading ? (
          <Skeleton className="h-10 w-32" />
        ) : config ? (
          <ReserveForm address={params.address} config={config} />
        ) : (
          <div className="text-sm text-muted-foreground">
            Configuration not found
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Reserve Ratio */}
            <ReserveRatio value={calculateReserveRatio()} />

            {/* Reserve Composition Chart */}
            <ReserveComposition
              bankDeposits={config?.reserveComposition?.bankDeposits ?? 0}
              governmentBonds={config?.reserveComposition?.governmentBonds ?? 0}
              highQualityLiquidAssets={
                config?.reserveComposition?.highQualityLiquidAssets ?? 0
              }
              corporateBonds={config?.reserveComposition?.corporateBonds ?? 0}
              centralBankAssets={
                config?.reserveComposition?.centralBankAssets ?? 0
              }
              commodities={config?.reserveComposition?.commodities ?? 0}
              otherAssets={config?.reserveComposition?.otherAssets ?? 0}
            />

            {/* Reserve Details */}
            <ReserveDetails
              lastAuditDate={
                config?.lastAuditDate ? String(config.lastAuditDate) : undefined
              }
              reserveStatus={
                config?.reserveStatus
                  ? (config.reserveStatus as ReserveComplianceStatus)
                  : undefined
              }
              circulatingSupply={95} // This would come from blockchain data
              reserveValue={100} // This would come from external price feeds
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
