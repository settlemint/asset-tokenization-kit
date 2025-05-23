"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Address } from "viem";
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
        <div className="space-y-6">{/* TODO: Add content */}</div>
      </CardContent>
    </Card>
  );
}
