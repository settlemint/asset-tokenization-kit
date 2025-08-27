import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format } from "dnum";
import type { Dnum } from "dnum";

interface CurrentStatusCardProps {
  currentCollateral: Dnum;
  currentSupply: Dnum;
  utilization: number;
  symbol: string;
}

/**
 * Displays the current collateral status including total collateral,
 * used amount, and utilization percentage.
 *
 * Extracted from CollateralSheet to improve component modularity.
 */
export function CurrentStatusCard({
  currentCollateral,
  currentSupply,
  utilization,
  symbol,
}: CurrentStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Current Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Collateral</p>
            <p className="text-sm font-medium">
              {format(currentCollateral, { digits: 2 })} {symbol}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Tokens in Circulation
            </p>
            <p className="text-sm font-medium">
              {format(currentSupply, { digits: 2 })} {symbol}
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-xs font-medium">{utilization}%</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
