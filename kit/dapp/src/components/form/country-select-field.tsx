import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import {
  getCountries,
  getNumericCountries,
  type SupportedLocale,
} from "@/lib/zod/validators/iso-country-code";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface CountrySelectFieldProps extends SelectFieldProps {
  valueType?: "alpha2" | "numeric";
}

export function CountrySelectField({
  label,
  valueType = "alpha2",
  ...props
}: CountrySelectFieldProps) {
  const { i18n } = useTranslation();
  const options = useMemo(() => {
    // Map locale codes like "en-US" to "en"
    const baseLocale = i18n.language.split("-")[0] as SupportedLocale;

    if (valueType === "numeric") {
      const numericCountries = getNumericCountries(baseLocale);
      return Object.entries(numericCountries).map(([numeric, name]) => ({
        label: name,
        value: numeric,
      }));
    }

    const names = getCountries(baseLocale);
    return Object.entries(names).map(([code, name]) => ({
      label: name,
      value: code,
    }));
  }, [i18n.language, valueType]);

  return <SelectField label={label} options={options} {...props} />;
}
