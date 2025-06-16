"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { SummaryRow } from "../../common/summary/summary";

export function CryptoConfigurationCard() {
  const { getValues } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");
  const baseCurrency = useSettings("baseCurrency");
  const locale = useLocale();

  // Get form values
  const formValues = getValues();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-medium text-base">
              {t("summary.configuration-title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("summary.configuration-description")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-200">
          <SummaryRow
            label={t("parameters.cryptocurrencies.initial-supply-label")}
            value={formValues.initialSupply || "-"}
          />
          <SummaryRow
            label={t("parameters.common.price-label")}
            value={formatNumber(formValues.price?.amount || 0, {
              currency: formValues.price?.currency || baseCurrency,
              locale: locale,
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
