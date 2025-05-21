"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReserveRatioProps {
  value: number;
  circulatingSupply: number;
  reserveValue: number;
}

export function ReserveRatio({
  value,
  circulatingSupply,
  reserveValue,
}: ReserveRatioProps) {
  // Calculate the excess percentage (how much over 100%)
  const excessPercentage = value > 100 ? value - 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h3 className="text-muted-foreground text-sm">Reserve ratio</h3>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-4xl font-semibold">{value}%</span>
          {excessPercentage > 0 && (
            <Badge
              className={cn(
                "h-6 px-2",
                "bg-success/20 text-success hover:bg-success/30"
              )}
            >
              +{excessPercentage.toFixed(1)}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
