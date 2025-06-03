import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
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
        <Badge
          className={`mt-2 ${
            isCompliant
              ? "!bg-success/80 !text-success-foreground"
              : "!bg-warning/80 !text-warning-foreground"
          } border-transparent`}
        >
          {isCompliant ? (
            <CheckCircle className="mr-1 size-3" />
          ) : (
            <AlertCircle className="mr-1 size-3" />
          )}
          {isCompliant ? t("compliant") : t("non-compliant")}
        </Badge>
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
