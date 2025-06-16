"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ReserveRatioProps {
  value: number;
}

export function ReserveRatio({ value }: ReserveRatioProps) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status.ratio");
  const excessPercentage = value > 100 ? value - 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h3 className="text-muted-foreground text-sm">{t("title")}</h3>
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
