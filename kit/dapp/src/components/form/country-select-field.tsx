import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import {
  getCountries,
  type SupportedLocale,
} from "@/lib/zod/validators/iso-country-code";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function CountrySelectField({ label, ...props }: SelectFieldProps) {
  const { i18n } = useTranslation();
  const options = useMemo(() => {
    // Map locale codes like "en-US" to "en"
    const baseLocale = i18n.language.split("-")[0] as SupportedLocale;
    const names = getCountries(baseLocale);
    return Object.entries(names).map(([code, name]) => ({
      label: name,
      value: code,
    }));
  }, [i18n.language]);

  return <SelectField label={label} options={options} {...props} />;
}
