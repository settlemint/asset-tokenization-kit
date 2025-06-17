import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { SummaryRow } from "../../common/summary/summary";

export function FundConfigurationCard() {
  const { getValues } = useFormContext<CreateFundInput>();
  const t = useTranslations("private.assets.create");
  const locale = useLocale();

  // Get form values
  const formValues = getValues();
  const {
    assetName,
    symbol,
    decimals,
    isin,
    fundClass,
    fundCategory,
    managementFeeBps,
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
              {t("configuration.funds.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("configuration.funds.description")}
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
            label={t("parameters.funds.fund-class-label")}
            value={fundClass || undefined}
          />
          <SummaryRow
            label={t("parameters.funds.fund-category-label")}
            value={fundCategory || undefined}
          />
          <SummaryRow
            label={t("parameters.funds.management-fee-label")}
            value={
              managementFeeBps
                ? `${managementFeeBps / 100}% (${managementFeeBps} ${t("parameters.funds.basis-points")})`
                : undefined
            }
          />
          <SummaryRow
            label={t("parameters.common.price-label")}
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
