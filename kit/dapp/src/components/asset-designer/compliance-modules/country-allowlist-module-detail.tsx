import { complianceModuleConfig } from "@/components/compliance/config";
import { CountryMultiselect } from "@/components/country/country-multiselect";
import { Button } from "@/components/ui/button";
import {
  ComplianceTypeIdEnum,
  type CountryAllowListValues,
} from "@/lib/zod/validators/compliance";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CountryAllowlistModuleDetailProps {
  values: CountryAllowListValues;
  close: () => void;
  onEnable: (values: CountryAllowListValues) => void;
  onDisable: () => void;
}

export function CountryAllowlistModuleDetail({
  values,
  close,
  onEnable,
  onDisable,
}: CountryAllowlistModuleDetailProps) {
  const { t } = useTranslation(["compliance-modules", "asset-designer"]);
  const config =
    complianceModuleConfig[
      ComplianceTypeIdEnum.CountryAllowListComplianceModule
    ];
  const [countryCodes, setCountryCodes] =
    useState<CountryAllowListValues>(values);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={close}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t("asset-designer:compliance.title")}
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col items-start mb-6 space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <config.icon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              {t("modules.countryAllowList.title")}
            </h2>
          </div>
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("modules.countryAllowList.description")}
            </p>
          </div>
          <CountryMultiselect
            value={values}
            onChange={(values) => {
              setCountryCodes(values.map((value) => value.numeric));
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Button variant="outline" onClick={close}>
          {t("asset-designer:form.buttons.back")}
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onDisable();
              close();
            }}
          >
            {t("asset-designer:form.buttons.disable")}
          </Button>
          <Button
            onClick={() => {
              onEnable(countryCodes);
              close();
            }}
          >
            {t("asset-designer:form.buttons.enable")}
          </Button>
        </div>
      </div>
    </div>
  );
}
