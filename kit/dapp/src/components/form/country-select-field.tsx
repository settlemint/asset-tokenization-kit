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

interface NationalitySelectFieldProps extends SelectFieldProps {}

export function CountrySelectField({
  label,
  ...props
}: NationalitySelectFieldProps) {
  const { i18n } = useTranslation();
  const options = useMemo(() => {
    const names = getCountries(i18n.language as SupportedLocale);
    return Object.entries(names).map(([code, name]) => ({
      label: name,
      value: code,
    }));
  }, [i18n.language]);

  return <SelectField label={label} options={options} {...props} />;
}
