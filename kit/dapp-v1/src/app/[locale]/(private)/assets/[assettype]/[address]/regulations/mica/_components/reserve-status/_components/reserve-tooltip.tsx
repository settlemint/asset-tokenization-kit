"use client";

import type { ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { TooltipProps } from "recharts";

interface ReserveTooltipProps extends TooltipProps<number, string> {
  config: ChartConfig;
  className?: string;
}

export function ReserveTooltip({
  active,
  payload,
  className,
  config,
}: ReserveTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const name = item.name || item.dataKey || "value";
          const indicatorColor = item.color;

          return (
            <div
              key={name}
              className="[&>svg]:text-muted-foreground flex w-full items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
            >
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: indicatorColor,
                }}
              />
              <span className="text-muted-foreground">
                {config[name as keyof typeof config]?.label}
              </span>
              <span className="text-foreground ml-auto">{item.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
