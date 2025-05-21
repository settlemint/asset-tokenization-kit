"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ReserveTooltip } from "./reserve-tooltip";

interface ReserveCompositionProps {
  bankDeposits: number;
  governmentBonds: number;
  liquidAssets: number;
  corporateBonds: number;
  centralBankAssets: number;
  commodities: number;
  otherAssets: number;
}

type AssetType =
  | "Bank Deposits"
  | "Government Bonds"
  | "Liquid Assets"
  | "Corporate Bonds"
  | "Central Bank Assets"
  | "Commodities"
  | "Other Assets";

interface DataEntry {
  name: AssetType;
  percentage: number;
}

export function ReserveComposition({
  bankDeposits,
  governmentBonds,
  liquidAssets,
  corporateBonds,
  centralBankAssets,
  commodities,
  otherAssets,
}: ReserveCompositionProps) {
  const data: DataEntry[] = [
    {
      name: "Bank Deposits",
      percentage: bankDeposits,
    },
    {
      name: "Government Bonds",
      percentage: governmentBonds,
    },
    {
      name: "Liquid Assets",
      percentage: liquidAssets,
    },
    {
      name: "Corporate Bonds",
      percentage: corporateBonds,
    },
    {
      name: "Central Bank Assets",
      percentage: centralBankAssets,
    },
    {
      name: "Commodities",
      percentage: commodities,
    },
    {
      name: "Other Assets",
      percentage: otherAssets,
    },
  ];

  const config = {
    "Bank Deposits": {
      label: "Bank Deposits",
      color: "hsl(221, 83%, 53%)", // blue-600
    },
    "Government Bonds": {
      label: "Government Bonds",
      color: "hsl(217, 91%, 60%)", // blue-500
    },
    "Liquid Assets": {
      label: "Liquid Assets",
      color: "hsl(214, 95%, 67%)", // blue-400
    },
    "Corporate Bonds": {
      label: "Corporate Bonds",
      color: "hsl(210, 98%, 74%)", // blue-300
    },
    "Central Bank Assets": {
      label: "Central Bank Assets",
      color: "hsl(206, 100%, 81%)", // blue-200
    },
    Commodities: {
      label: "Commodities",
      color: "hsl(204, 100%, 88%)", // blue-100
    },
    "Other Assets": {
      label: "Other Assets",
      color: "hsl(202, 100%, 95%)", // blue-50
    },
  } as const;

  return (
    <div className="space-top-2">
      <h3 className="text-muted-foreground text-sm">Reserve Composition</h3>
      <div className="flex flex-col mt-1">
        <ChartContainer config={config} className="w-full h-[60px]">
          <BarChart
            width={600}
            height={30}
            data={[
              {
                name: "Reserve",
                ...Object.fromEntries(data.map((d) => [d.name, d.percentage])),
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
            {data.map((entry) => (
              <Bar
                key={entry.name}
                dataKey={entry.name}
                stackId="stack"
                fill={config[entry.name].color}
                fillOpacity={0.5}
                stroke={config[entry.name].color}
              />
            ))}
          </BarChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 shrink-0"
                style={{
                  backgroundColor: config[entry.name].color,
                }}
              />
              <p className="text-muted-foreground text-xs">
                {config[entry.name].label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
