import MultipleSelector from "@/components/ui/multiselect";
import { useCountries } from "@/hooks/use-countries";
import { useTranslation } from "react-i18next";

interface CountryMultiselectProps {
  value: { name: string; numericCode: string }[];
  onChange: (value: { name: string; numericCode: string }[]) => void;
}

export function CountryMultiselect({
  value,
  onChange,
}: CountryMultiselectProps) {
  const { t } = useTranslation("country-multiselect");
  const { getNumericCodeByName, getCountryOptions } = useCountries();

  const countriesOptions = getCountryOptions("name");

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
        numericCode: getNumericCodeByName(option.value) ?? "0",
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
