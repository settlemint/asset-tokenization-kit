import MultipleSelector from "@/components/ui/multiselect";
import countries, { alpha2ToNumeric, getAlpha2Code } from "i18n-iso-countries";
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
  const countriesMap = countries.getNames(i18n.language, {
    select: "official",
  });
  const countriesOptions = Object.entries(countriesMap).map(([, value]) => ({
    value: value,
    label: value,
  }));

  const getNumericCodeFromName = (name: string) => {
    const alpha2Code = getAlpha2Code(name, i18n.language);

    if (!alpha2Code) {
      throw new Error(`Alpha2 code for country ${name} not found`);
    }
    const numericCode = alpha2ToNumeric(alpha2Code);
    return {
      numericCode: numericCode ?? "",
    };
  };

  return (
    <MultipleSelector
      commandProps={{
        label: t("label"),
      }}
      value={value.map(({ name }) => {
        return {
          value: name,
          label: name,
        };
      })}
      onChange={(options) => {
        onChange(
          options.map((option) => ({
            name: option.value,
            ...getNumericCodeFromName(option.value),
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
