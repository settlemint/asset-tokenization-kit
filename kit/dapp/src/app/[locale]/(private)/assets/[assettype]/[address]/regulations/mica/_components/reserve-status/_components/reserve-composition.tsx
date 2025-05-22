"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ChartColumnIncreasingIcon } from "@/components/ui/chart-column-increasing";
import { useTranslations } from "next-intl";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ReserveTooltip } from "./reserve-tooltip";

interface ReserveCompositionProps {
  bankDeposits?: number;
  governmentBonds?: number;
  highQualityLiquidAssets?: number;
  corporateBonds?: number;
  centralBankAssets?: number;
  commodities?: number;
  otherAssets?: number;
}

interface ReserveEntry {
  id: string;
  label: string;
  color: string;
  percentage: number;
}

export function ReserveComposition({
  bankDeposits = 0,
  governmentBonds = 0,
  highQualityLiquidAssets = 0,
  corporateBonds = 0,
  centralBankAssets = 0,
  commodities = 0,
  otherAssets = 0,
}: ReserveCompositionProps) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");

  // Check if all values are 0
  const isEmpty = [
    bankDeposits,
    governmentBonds,
    highQualityLiquidAssets,
    corporateBonds,
    centralBankAssets,
    commodities,
    otherAssets,
  ].every((value) => value === 0);

  const reserveData: ReserveEntry[] = [
    {
      id: "bankDeposits",
      label: t("form.fields.reserve-composition.fields.bank-deposits.title"),
      color: "hsl(221, 83%, 53%)", // blue-600
      percentage: bankDeposits,
    },
    {
      id: "governmentBonds",
      label: t("form.fields.reserve-composition.fields.government-bonds.title"),
      color: "hsl(217, 91%, 60%)", // blue-500
      percentage: governmentBonds,
    },
    {
      id: "highQualityLiquidAssets",
      label: t(
        "form.fields.reserve-composition.fields.high-quality-liquid-assets.title"
      ),
      color: "hsl(214, 95%, 67%)", // blue-400
      percentage: highQualityLiquidAssets,
    },
    {
      id: "corporateBonds",
      label: t("form.fields.reserve-composition.fields.corporate-bonds.title"),
      color: "hsl(210, 98%, 74%)", // blue-300
      percentage: corporateBonds,
    },
    {
      id: "centralBankAssets",
      label: t(
        "form.fields.reserve-composition.fields.central-bank-assets.title"
      ),
      color: "hsl(206, 100%, 81%)", // blue-200
      percentage: centralBankAssets,
    },
    {
      id: "commodities",
      label: t("form.fields.reserve-composition.fields.commodities.title"),
      color: "hsl(204, 100%, 88%)", // blue-100
      percentage: commodities,
    },
    {
      id: "otherAssets",
      label: t("form.fields.reserve-composition.fields.other-assets.title"),
      color: "hsl(202, 100%, 95%)", // blue-50
      percentage: otherAssets,
    },
  ];

  // Create a config object for the ChartContainer from the reserveData
  const config = Object.fromEntries(
    reserveData.map((entry) => [
      entry.id,
      { label: entry.label, color: entry.color },
    ])
  );

  return (
    <div className="space-top-2">
      <h3 className="text-muted-foreground text-sm">
        {t("composition.title")}
      </h3>

      {isEmpty && (
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("composition.no-data")}</p>
        </div>
      )}

      {!isEmpty && (
        <div className="flex flex-col mt-1">
          <ChartContainer config={config} className="w-full h-[60px]">
            <BarChart
              width={600}
              height={30}
              data={[
                {
                  name: "Reserve",
                  ...Object.fromEntries(
                    reserveData.map((entry) => [entry.id, entry.percentage])
                  ),
                },
              ]}
              layout="vertical"
              stackOffset="expand"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide domain={[0, 1]} />
              <YAxis type="category" hide />
              <ChartTooltip
                cursor={false}
                content={<ReserveTooltip config={config} />}
                wrapperStyle={{ minWidth: "200px", width: "auto" }}
              />
              {reserveData.map((entry) => (
                <Bar
                  key={entry.id}
                  dataKey={entry.id}
                  stackId="stack"
                  fill={entry.color}
                  fillOpacity={0.5}
                  stroke={entry.color}
                />
              ))}
            </BarChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {reserveData.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-muted-foreground text-xs">{entry.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
