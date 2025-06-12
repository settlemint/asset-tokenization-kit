import { StatusPill } from "@/components/blocks/status-pill/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function ConsumerProtectionLayout({
  burnEventCount,
}: {
  burnEventCount: bigint;
}) {
  const t = useTranslations("regulations.mica.dashboard.consumer-protection");

  // TODO: this should come from the new subgraph
  const totalRedemptions = burnEventCount;
  const averageRedemptionTime = "-"; // We assume this is immediate
  const completedWithin24Hours = 100; // We assume this is always true
  const redemptionsAtParValue = 100; // We assume this is always true

  const isCompliant =
    redemptionsAtParValue === 100 && completedWithin24Hours === 100;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <div className="mt-2">
          <StatusPill
            status={isCompliant ? "success" : "warning"}
            label={isCompliant ? t("compliant") : t("non-compliant")}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("total-redemptions")}
            </h3>
            <p>{totalRedemptions.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("average-redemption-time")}
            </h3>
            <p>{averageRedemptionTime}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("completed-within-24-hours")}
            </h3>
            <p>{completedWithin24Hours}%</p>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-muted-foreground text-sm">
                {t("redemptions-at-par-value")}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="size-4 text-muted-foreground"
                      aria-label={t("redemptions-at-par-value-info")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-accent-foreground text-xs">
                      {t("redemptions-at-par-value-info")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p>{redemptionsAtParValue}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
