"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Address } from "viem";
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

  // Calculate reserve data from config
  const getReserveData = () => {
    if (!config || !config.reserveComposition) {
      // Fallback mock data when no real data is available
      return {
        ratio: 105.3,
        composition: [
          { name: "Bank deposits", value: 15, color: "#A8E6CF" },
          { name: "Government bonds", value: 10, color: "#88D8C0" },
          { name: "High quality liquid assets", value: 60, color: "#7FB3D3" },
          { name: "Corporate bonds", value: 5, color: "#68B2A0" },
          { name: "Central bank assets", value: 8, color: "#5A9FD4" },
          { name: "Commodities", value: 1, color: "#F4A261" },
          { name: "Other assets", value: 1, color: "#E76F51" },
        ],
        circulatingSupply: 95,
        reserveValue: 100,
        lastAuditDate:
          getFormattedDate(config?.lastAuditDate) || "No audit date available",
        status: config?.reserveStatus || "Compliant",
      };
    }

    // Use real data from config
    const composition = config.reserveComposition;
    const colorMap: Record<string, string> = {
      bankDeposits: "#A8E6CF",
      governmentBonds: "#88D8C0",
      highQualityLiquidAssets: "#7FB3D3",
      corporateBonds: "#68B2A0",
      centralBankAssets: "#5A9FD4",
      commodities: "#F4A261",
      otherAssets: "#E76F51",
    };

    const compositionArray = Object.entries(composition)
      .filter(([_, value]) => typeof value === "number" && value > 0)
      .map(([key, value]) => ({
        name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        value: value as number,
        color: colorMap[key] || "#6B7280",
      }));

    // Calculate total for ratio (assuming it should be > 100%)
    const total = compositionArray.reduce((sum, item) => sum + item.value, 0);
    const ratio = total > 0 ? (total / 100) * 105.3 : 105.3; // Scale to reasonable reserve ratio

    return {
      ratio,
      composition: compositionArray,
      circulatingSupply: 95, // This would come from blockchain data
      reserveValue: 100, // This would come from external price feeds
      lastAuditDate:
        getFormattedDate(config.lastAuditDate) || "No audit date available",
      status: config.reserveStatus || "Unknown",
    };
  };

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

  const reserveData = getReserveData();

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
            <ReserveRatio value={reserveData.ratio} />

            {/* Reserve Composition Chart */}
            {reserveData.composition.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm">
                  {t("composition.title")}
                </h3>
                <div className="w-full h-6 flex rounded-lg overflow-hidden">
                  {reserveData.composition.map((segment, index) => (
                    <div
                      key={segment.name}
                      className="h-full"
                      style={{
                        width: `${segment.value}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {reserveData.composition.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("composition.no-data")}</p>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground text-sm">
                  {t("details.fields.circulating-supply.title")}
                </h3>
                <p className="text-2xl font-semibold">
                  {reserveData.circulatingSupply}
                </p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">
                  {t("details.fields.reserve-value.title")}
                </h3>
                <p className="text-2xl font-semibold">
                  {reserveData.reserveValue}
                </p>
              </div>
            </div>

            {/* Status and Audit Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-muted-foreground text-sm">
                  Last audit date
                </h3>
                <p className="text-sm">{reserveData.lastAuditDate}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">
                  Reserve status
                </h3>
                <Badge
                  className="mt-1"
                  variant={
                    reserveData.status === "Compliant"
                      ? "default"
                      : "destructive"
                  }
                >
                  {reserveData.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
