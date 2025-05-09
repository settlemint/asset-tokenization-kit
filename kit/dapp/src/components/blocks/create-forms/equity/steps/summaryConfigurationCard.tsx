import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { SummaryRow } from "../../common/summary/summary";

interface EquityConfigurationCardProps {
  form: UseFormReturn<CreateEquityInput>;
}

export function EquityConfigurationCard({
  form,
}: EquityConfigurationCardProps) {
  const { getValues } = form;
  const t = useTranslations("private.assets.create");

  // Get form values
  const formValues = getValues();
  const {
    assetName,
    symbol,
    decimals,
    isin,
    equityClass,
    equityCategory,
    price,
  } = formValues;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-medium text-base">
              {t("configuration.equities.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("configuration.equities.description")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-200">
          <SummaryRow
            label={t("parameters.common.name-label")}
            value={assetName}
          />
          <SummaryRow
            label={t("parameters.common.symbol-label")}
            value={symbol}
          />
          <SummaryRow
            label={t("parameters.common.decimals-label")}
            value={decimals}
          />
          {isin && (
            <SummaryRow
              label={t("parameters.common.isin-label")}
              value={isin}
            />
          )}
          <SummaryRow
            label={t("parameters.equities.equity-class-label")}
            value={equityClass}
          />
          <SummaryRow
            label={t("parameters.equities.equity-category-label")}
            value={equityCategory}
          />
          <SummaryRow
            label={t("parameters.common.price-label")}
            value={`${price.amount} ${price.currency}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
