"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface GaugeChartProps {
  title: string;
  description?: string;
  value: number;
  max: number;
  className?: string;
  footer?: ReactNode;
  thresholds?: {
    medium: number;
    high: number;
  };
  colors?: {
    low: string;
    medium: string;
    high: string;
  };
}

/**
 * A gauge chart that shows a value as a percentage on a semi-circular gauge
 * The gauge changes color based on the value relative to thresholds
 * The gauge fills up to the percentage value (0-100%)
 */
export function GaugeChart({
  title,
  description,
  value,
  max,
  className,
  footer,
  thresholds = {
    medium: 100, // Yellow starts at 100%
    high: 200,   // Green starts at 200%
  },
  colors = {
    low: "var(--destructive)",        // Red for low values
    medium: "var(--warning)",         // Yellow for medium values
    high: "var(--success)",           // Green for high values
  },
}: GaugeChartProps) {
  // Calculate percentage (cap at max threshold for display purposes)
  const percentageValue = (value / max) * 100;
  const displayPercentage = Math.min(Math.round(percentageValue), 100);
  const fillPercentage = Math.min(percentageValue, 100);

  // Determine the color based on thresholds
  let gaugeColor = colors.low;

  if (percentageValue >= thresholds.high) {
    gaugeColor = colors.high;
  } else if (percentageValue >= thresholds.medium) {
    gaugeColor = colors.medium;
  }

  // Create data for gauge (filled portion) and background (empty portion)
  const startAngle = 180;
  const maxAngle = 180; // Total angle range of semi-circle

  // Calculate the end angle based on the fill percentage
  // 180 degrees = left side (0%), 0 degrees = right side (100%)
  const endAngle = startAngle - (fillPercentage / 100) * maxAngle;

  // Create gauge segments
  const gaugeData = [{ name: "gauge", value: 100 }];

  // Config for the gauge
  const config: ChartConfig = {
    gauge: {
      color: gaugeColor,
    },
    background: {
      color: "var(--muted)", // Gray color for the background
    }
  };

  // Background track (gray semi-circle)
  const backgroundData = [{ name: "background", value: 100 }];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full h-40 max-w-[180px] mx-auto flex flex-col items-center justify-center">
            {/* Semi-circular gauge - positioned above percentage */}
            <div className="w-full">
              <div className="w-full h-[80px] relative">
                {/* Background track (gray) and colored gauge */}
                <ChartContainer className="w-full h-full" config={config}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    {/* Background track (gray semi-circle) */}
                    <Pie
                      data={backgroundData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="100%"
                      innerRadius="110%"
                      outerRadius="200%"
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={0}
                      strokeWidth={0}
                    >
                      <Cell fill="var(--muted)" fillOpacity={0.2} />
                    </Pie>

                    {/* Colored gauge (filled portion) */}
                    <Pie
                      data={gaugeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="100%"
                      innerRadius="110%"
                      outerRadius="200%"
                      startAngle={startAngle}
                      endAngle={endAngle}
                      paddingAngle={0}
                      strokeWidth={0}
                    >
                      <Cell fill={gaugeColor} />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
            </div>

            {/* Percentage Display - below the gauge */}
            <div className="mt-4 text-center">
              <span className="text-2xl font-semibold">{displayPercentage}%</span>
            </div>
          </div>
        </div>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}