"use client";

import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";

interface AssetClassCharacteristicsProps {
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

// Define the asset types for the radar chart
type AssetType =
  | "Real Estate"
  | "Equity"
  | "Debt"
  | "Commodities"
  | "Crypto"
  | "Alternative";

// Define the config type
type AssetConfig = {
  [key in AssetType]: {
    color: string;
    label: string;
  };
};

/**
 * Radar chart showing asset class characteristics (return potential, volatility, and liquidity)
 * for different asset types.
 */
export function AssetClassCharacteristics({
  className,
  title,
  description,
  footer,
}: AssetClassCharacteristicsProps) {
  const t = useTranslations("components.charts.assets");

  // Hardcoded data based on the image provided
  // Scale is from 0-100 for each characteristic
  const data = [
    {
      characteristic: t("real-estate"),
      Alternative: 75,
      Equity: 82,
      Debt: 45,
      Crypto: 50,
      Commodities: 60,
      "Real Estate": 65,
    },
    {
      characteristic: t("equity"),
      Alternative: 85,
      Equity: 90,
      Debt: 30,
      Crypto: 65,
      Commodities: 50,
      "Real Estate": 60,
    },
    {
      characteristic: t("debt"),
      Alternative: 65,
      Equity: 40,
      Debt: 85,
      Crypto: 30,
      Commodities: 35,
      "Real Estate": 50,
    },
    {
      characteristic: t("crypto"),
      Alternative: 70,
      Equity: 30,
      Debt: 20,
      Crypto: 85,
      Commodities: 25,
      "Real Estate": 25,
    },
    {
      characteristic: t("commodities"),
      Alternative: 55,
      Equity: 35,
      Debt: 45,
      Crypto: 40,
      Commodities: 70,
      "Real Estate": 40,
    },
    {
      characteristic: t("alternative"),
      Alternative: 90,
      Equity: 45,
      Debt: 40,
      Crypto: 60,
      Commodities: 55,
      "Real Estate": 50,
    },
  ];

  // Define colors for each asset type
  const config: AssetConfig = {
    "Real Estate": {
      color: getAssetColor("bond", "color"),
      label: t("real-estate"),
    },
    Equity: {
      color: getAssetColor("equity", "color"),
      label: t("equity"),
    },
    Debt: {
      color: getAssetColor("bond", "color"),
      label: t("debt"),
    },
    Commodities: {
      color: getAssetColor("deposit", "color"),
      label: t("commodities"),
    },
    Crypto: {
      color: getAssetColor("cryptocurrency", "color"),
      label: t("crypto"),
    },
    Alternative: {
      color: "#E83E8C", // Pink color from the image
      label: t("alternative"),
    },
  };

  // Get asset types from config for the radar layers
  const assetTypes = Object.keys(config) as AssetType[];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title || t("asset-class-characteristics")}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={config}>
            <RadarChart
              data={data}
              margin={{ top: 10, right: 30, bottom: 30, left: 30 }}
            >
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="characteristic"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tickCount={5}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              />
              {assetTypes.map((type) => (
                <Radar
                  key={type}
                  name={config[type].label}
                  dataKey={type}
                  stroke={config[type].color}
                  fill={config[type].color}
                  fillOpacity={0.4}
                />
              ))}
              <Tooltip />
              <ChartLegend
                verticalAlign="bottom"
                content={<ChartLegendContent />}
                className="pt-4"
              />
            </RadarChart>
          </ChartContainer>
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
}
