import { complianceModuleConfig } from "@/components/compliance/config";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { CountryMultiselect } from "@/components/country/country-multiselect";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/use-countries";
import { encodeCountryParams } from "@/lib/compliance/encoding/encode-country-params";
import { arraysEqual } from "@/lib/utils/array";
import { ComplianceTypeIdEnum } from "@/lib/zod/validators/compliance";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function CountryBlocklistModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<"CountryBlockListComplianceModule">) {
  const { t } = useTranslation(["compliance-modules", "form"]);
  const { getCountryByNumericCode } = useCountries();

  const config =
    complianceModuleConfig[
      ComplianceTypeIdEnum.CountryBlockListComplianceModule
    ];

  // Convert numeric country codes to alpha2 codes for CountryMultiselect
  const initialCountries =
    initialValues?.values.map((numericCode) => {
      const name = getCountryByNumericCode(numericCode);
      return {
        name: name ?? "",
        numericCode: numericCode.toString(),
      };
    }) ?? [];

  const [selectedCountries, setSelectedCountries] =
    useState<{ name: string; numericCode: string }[]>(initialCountries);

  const handleEnable = () => {
    // Convert selected countries to numeric codes and encode
    const numericCodes = selectedCountries.map(
      (country) => country.numericCode
    );
    const encodedParams = encodeCountryParams(numericCodes);
    onEnable({
      typeId,
      module,
      values: numericCodes,
      params: encodedParams,
    });
  };

  const handleDisable = () => {
    onDisable({
      typeId,
      module,
      values: [],
      params: "0x0",
    });
  };

  const isInputChanged = !arraysEqual(
    selectedCountries.map((c) => Number.parseInt(c.numericCode)),
    initialValues?.values ?? []
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t("compliance-modules:title")}
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col items-start mb-6 space-y-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div>
                <config.icon className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                {t("modules.countryBlockList.title")}
              </h2>
            </div>
            <div>
              {isEnabled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDisable();
                    onClose();
                  }}
                >
                  {t("form:buttons.disable")}
                </Button>
              )}
              {!isEnabled && (
                <Button onClick={handleEnable}>
                  {t("form:buttons.enable")}
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("modules.countryBlockList.description")}
            </p>
          </div>
          {isEnabled && (
            <CountryMultiselect
              value={selectedCountries}
              onChange={(countries) => {
                setSelectedCountries(countries);
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>
          {t("form:buttons.back")}
        </Button>
        <Button
          disabled={!isEnabled || !isInputChanged}
          onClick={() => {
            handleEnable();
            onClose();
          }}
        >
          {t("form:buttons.save")}
        </Button>
      </div>
    </div>
  );
}
