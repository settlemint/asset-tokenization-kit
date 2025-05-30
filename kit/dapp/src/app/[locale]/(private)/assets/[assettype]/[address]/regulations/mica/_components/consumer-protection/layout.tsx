import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function ConsumerProtectionLayout() {
  const t = useTranslations("regulations.mica.dashboard.consumer-protection");

  const totalRedemptions = 1000; // TODO: get from API
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
            <h3 className="text-muted-foreground text-sm">
              {t("redemptions-at-par-value")}
            </h3>
            <p>{redemptionsAtParValue}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
