import { complianceModuleConfig } from "@/components/compliance/config";
import {
  ComplianceDetailActions,
  ComplianceDetailBreadcrumb,
  ComplianceDetailCard,
  ComplianceDetailContent,
  ComplianceDetailDescription,
  ComplianceDetailFooter,
  ComplianceDetailForm,
  ComplianceDetailHeader,
  ComplianceDetailSection,
  ComplianceDetailTitle,
} from "@/components/compliance/details/compliance-detail-card";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { CountryMultiselect } from "@/components/country/country-multiselect";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/use-countries";
import { haveSameNumbers } from "@/lib/utils/array";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type CountryModuleType =
  | "CountryAllowListComplianceModule"
  | "CountryBlockListComplianceModule";

export function CountryRestrictionModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<CountryModuleType>) {
  const { t } = useTranslation(["compliance-modules", "form"]);
  const { getCountryByNumericCode } = useCountries();

  const config = complianceModuleConfig[typeId];

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
    onEnable({
      typeId,
      module,
      values: numericCodes,
    });
  };

  const handleDisable = () => {
    onDisable({
      typeId,
      module,
      values: [],
    });
  };

  const isInputChanged = !haveSameNumbers(
    selectedCountries.map((c) => Number.parseInt(c.numericCode)),
    initialValues?.values ?? []
  );

  return (
    <ComplianceDetailCard>
      <ComplianceDetailHeader>
        <ComplianceDetailBreadcrumb onClose={onClose}>
          {t("compliance-modules:title")}
        </ComplianceDetailBreadcrumb>
      </ComplianceDetailHeader>

      <ComplianceDetailContent>
        <ComplianceDetailSection>
          <ComplianceDetailTitle
            icon={<config.icon className="w-5 h-5" />}
            action={
              <ComplianceDetailActions
                isEnabled={isEnabled}
                onEnable={handleEnable}
                onDisable={handleDisable}
                onClose={onClose}
              />
            }
          >
            {t(`modules.${typeId}.title`)}
          </ComplianceDetailTitle>

          <ComplianceDetailDescription>
            {t(`modules.${typeId}.description`)}
          </ComplianceDetailDescription>

          {isEnabled && (
            <ComplianceDetailForm>
              <CountryMultiselect
                value={selectedCountries}
                onChange={(countries) => {
                  setSelectedCountries(countries);
                }}
              />
            </ComplianceDetailForm>
          )}
        </ComplianceDetailSection>
      </ComplianceDetailContent>

      <ComplianceDetailFooter>
        <Button variant="outline" onClick={onClose} className="press-effect">
          {t("form:buttons.back")}
        </Button>
        <Button
          disabled={!isEnabled || !isInputChanged}
          onClick={() => {
            handleEnable();
            onClose();
          }}
          className="press-effect"
        >
          {t("form:buttons.save")}
        </Button>
      </ComplianceDetailFooter>
    </ComplianceDetailCard>
  );
}
