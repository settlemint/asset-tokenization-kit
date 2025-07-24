import MultipleSelector from "@/components/ui/multiselect";
import countries from "i18n-iso-countries";
import { useTranslation } from "react-i18next";

interface CountryMultiselectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
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

  return (
    <MultipleSelector
      commandProps={{
        label: t("label"),
      }}
      value={value?.map((country) => ({
        value: country,
        label: country,
      }))}
      onChange={(options) => {
        onChange?.(options.map((option) => option.value));
      }}
      defaultOptions={countriesOptions}
      placeholder={t("placeholder")}
      hidePlaceholderWhenSelected
      emptyIndicator={<p className="text-center text-sm">{t("emptyIndicator")}</p>}
    />
  );
}
