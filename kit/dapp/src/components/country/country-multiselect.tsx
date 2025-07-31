import MultipleSelector from "@/components/ui/multiselect";
import {
  getNumericCountryCode,
  getSupportedLocales,
} from "@/lib/zod/validators/iso-country-code";
import countries from "i18n-iso-countries";
import { useTranslation } from "react-i18next";

interface CountryMultiselectProps {
  value: { name: string; numericCode: string }[];
  onChange: (value: { name: string; numericCode: string }[]) => void;
}

export function CountryMultiselect({
  value,
  onChange,
}: CountryMultiselectProps) {
  const { i18n, t } = useTranslation("country-multiselect");

  // TODO: duplicated in country field too, make it a hook?
  // Map locale codes like "en-US" to "en" and fallback to "en" if not supported
  const lang = i18n.language.split("-")[0];
  const baseLocale = getSupportedLocales().find((l) => l === lang) ?? "en";

  const countriesMap = countries.getNames(baseLocale, {
    select: "official",
  });
  const countriesOptions = Object.entries(countriesMap).map(([, value]) => ({
    value: value,
    label: value,
  }));

  const valueOptions = value.map(({ name }) => {
    return {
      value: name,
      label: name,
    };
  });

  const onValueChange = (options: { value: string; label: string }[]) => {
    onChange(
      options.map((option) => ({
        name: option.value,
        numericCode: getNumericCountryCode(option.value, baseLocale) ?? "",
      }))
    );
  };

  return (
    <MultipleSelector
      commandProps={{
        label: t("label"),
      }}
      value={valueOptions}
      onChange={onValueChange}
      defaultOptions={countriesOptions}
      placeholder={t("placeholder")}
      hidePlaceholderWhenSelected
      emptyIndicator={
        <p className="text-center text-sm">{t("emptyIndicator")}</p>
      }
    />
  );
}
