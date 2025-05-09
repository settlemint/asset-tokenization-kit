"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { SummaryRow } from "../../common/summary/summary";

interface DepositConfigurationCardProps {
  form: UseFormReturn<any>;
}

export function DepositConfigurationCard({
  form,
}: DepositConfigurationCardProps) {
  const formValues = form.getValues();
  const t = useTranslations("private.assets.create");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="font-medium text-base">
              {t("configuration.deposits.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("configuration.deposits.description")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-slate-200">
          <SummaryRow
            label={t("parameters.common.price-label")}
            value={`${formValues.price?.amount || 0} ${formValues.price?.currency || ""}`}
          />
          <SummaryRow
            label="Collateral Liveness"
            value={`${formValues.collateralLivenessValue} ${formValues.collateralLivenessTimeUnit}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
