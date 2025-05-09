import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { SummaryRow } from "../../common/summary/summary";

interface StablecoinConfigurationCardProps {
  form: UseFormReturn<CreateStablecoinInput>;
}

export function StablecoinConfigurationCard({
  form,
}: StablecoinConfigurationCardProps) {
  const { getValues } = form;
  const t = useTranslations("private.assets.create");
  const locale = useLocale();

  // Get form values
  const formValues = getValues();
  const {
    assetName,
    symbol,
    decimals,
    collateralLivenessValue,
    collateralLivenessTimeUnit,
    price,
  } = formValues;

  // Format the collateral liveness period
  // Capitalize the first letter of the time unit
  const timeUnitDisplay =
    collateralLivenessTimeUnit.charAt(0).toUpperCase() +
    collateralLivenessTimeUnit.slice(1);
  const livenessDisplay = `${collateralLivenessValue} ${timeUnitDisplay}`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-medium text-base">Stablecoin Configuration</h3>
            <p className="text-xs text-muted-foreground">
              Configure your stablecoin parameters
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-200">
          <SummaryRow label="Name" value={assetName} />
          <SummaryRow label="Symbol" value={symbol} />
          <SummaryRow label="Decimals" value={decimals} />
          <SummaryRow label="Collateral Liveness" value={livenessDisplay} />
          <SummaryRow
            label="Price"
            value={formatNumber(price?.amount || 0, {
              currency: price?.currency,
              locale: locale,
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
