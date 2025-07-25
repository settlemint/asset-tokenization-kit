import MultipleSelector from "@/components/ui/multiselect";
import countries, {
  alpha2ToNumeric,
  getAlpha2Code,
  getName,
} from "i18n-iso-countries";
import { useTranslation } from "react-i18next";

interface CountryMultiselectProps {
  value: string[]; // ISO 3166-1 alpha-2 country codes
  onChange: (
    value: { name: string; numericCode: string; alpha2Code: string }[]
  ) => void;
}

export function CountryMultiselect({
  value,
  onChange,
}: CountryMultiselectProps) {
  const { i18n, t } = useTranslation("country-multiselect");
  const countriesMap = countries.getNames(i18n.language, {
    select: "official",
  });
  const countriesOptions = Object.entries(countriesMap).map(([, value]) => ({
    value: value,
    label: value,
  }));

  const getCountryCodes = (country: string) => {
    const alpha2Code = getAlpha2Code(country, i18n.language);
    if (!alpha2Code) {
      throw new Error(`Alpha2 code for country ${country} not found`);
    }

    const numericCode = alpha2ToNumeric(alpha2Code);
    if (!numericCode) {
      throw new Error(`Numeric code for country ${country} not found`);
    }

    return {
      numericCode,
      alpha2Code,
    };
  };

  return (
    <MultipleSelector
      commandProps={{
        label: t("label"),
      }}
      value={value.map((code) => {
        const name = getName(code, i18n.language);
        if (!name) {
          throw new Error(`Name for country ${code} not found`);
        }
        return {
          value: name,
          label: name,
        };
      })}
      onChange={(options) => {
        onChange(
          options.map((option) => ({
            name: option.value,
            ...getCountryCodes(option.value),
          }))
        );
      }}
      defaultOptions={countriesOptions}
      placeholder={t("placeholder")}
      hidePlaceholderWhenSelected
      emptyIndicator={
        <p className="text-center text-sm">{t("emptyIndicator")}</p>
      }
    />
  );
}
