"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import {
  SummaryRow,
  formatUnderlyingAsset,
} from "../../common/summary/summary";

interface BondConfigurationCardProps {
  form: UseFormReturn<any>;
}

export function BondConfigurationCard({ form }: BondConfigurationCardProps) {
  const formValues = form.getValues();
  const t = useTranslations("private.assets.create.configuration.bonds");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-medium text-base">{t("title")}</h3>
            <p className="text-xs text-muted-foreground">{t("description")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-200">
          <>
            <SummaryRow label={t("maximum-supply")} value={formValues.cap} />
            <SummaryRow label={t("face-value")} value={formValues.faceValue} />
            <SummaryRow
              label={t("maturity-date")}
              value={new Date(formValues.maturityDate).toLocaleString()}
            />
            <SummaryRow
              label={t("underlying-asset")}
              value={formatUnderlyingAsset(formValues.underlyingAsset)}
            />
          </>
        </div>
      </CardContent>
    </Card>
  );
}
