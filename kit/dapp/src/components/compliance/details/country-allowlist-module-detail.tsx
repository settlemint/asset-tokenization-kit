import { complianceModuleConfig } from "@/components/compliance/config";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { CountryMultiselect } from "@/components/country/country-multiselect";
import { Button } from "@/components/ui/button";
import { encodeCountryParams } from "@/lib/compliance/encoding/encode-country-params";
import { ComplianceTypeIdEnum } from "@/lib/zod/validators/compliance";
import { getSupportedLocales } from "@/lib/zod/validators/iso-country-code";
import { getName } from "i18n-iso-countries";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { zeroHash } from "viem";

export function CountryAllowlistModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<"CountryAllowListComplianceModule">) {
  const { t, i18n } = useTranslation(["compliance-modules", "form"]);
  // Map locale codes like "en-US" to "en"
  const lang = i18n.language.split("-")[0];
  const baseLocale = getSupportedLocales().find((l) => l === lang) ?? "en";

  const config =
    complianceModuleConfig[
      ComplianceTypeIdEnum.CountryAllowListComplianceModule
    ];
  // Convert numeric country codes to alpha2 codes for CountryMultiselect
  const initialCountries = initialValues?.values.map((numericCode) => {
    const name = getName(numericCode, baseLocale);
    return {
      name: name ?? "",
      numericCode: numericCode.toString(),
    };
  });

  const [selectedCountries, setSelectedCountries] = useState<
    { name: string; numericCode: string }[]
  >(initialCountries ?? []);

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
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <config.icon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              {t("modules.countryAllowList.title")}
            </h2>
            <div className="flex items-center gap-3">
              {isEnabled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onDisable({
                      typeId,
                      module,
                      values: [],
                      params: zeroHash,
                    });
                    onClose();
                  }}
                >
                  {t("form:buttons.disable")}
                </Button>
              )}
              {!isEnabled && (
                <Button
                  onClick={() => {
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
                  }}
                >
                  {t("form:buttons.enable")}
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("modules.countryAllowList.description")}
            </p>
          </div>
          <CountryMultiselect
            value={selectedCountries}
            onChange={(countries) => {
              setSelectedCountries(countries);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>
          {t("form:buttons.back")}
        </Button>
        <Button
          onClick={() => {
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
            onClose();
          }}
        >
          {t("form:buttons.save")}
        </Button>
      </div>
    </div>
  );
}
