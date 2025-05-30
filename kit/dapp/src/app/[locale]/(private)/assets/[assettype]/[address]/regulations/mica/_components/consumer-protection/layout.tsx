import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ConsumerProtectionLayout() {
  const totalRedemptions = 1000; // TODO: get from API
  const averageRedemptionTime = "-"; // We assume this is immediate
  const completedWithin24Hours = 100; // We assume this is always true
  const redemptionsAtParValue = 100; // We assume this is always true

  const isCompliant =
    redemptionsAtParValue === 100 && completedWithin24Hours === 100;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Consumer Protection</CardTitle>
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
          {isCompliant ? "Compliant" : "Non-Compliant"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-muted-foreground text-sm">Total Redemptions</h3>
            <p>{totalRedemptions.toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm">
              Average Redemption Time
            </h3>
            <p>{averageRedemptionTime}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm">
              Completed Within 24 Hours
            </h3>
            <p>{completedWithin24Hours}%</p>
          </div>

          <div>
            <h3 className="text-muted-foreground text-sm">
              Redemptions at Par Value
            </h3>
            <p>{redemptionsAtParValue}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
