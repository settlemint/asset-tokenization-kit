import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import { useCountries } from "@/hooks/use-countries";

export interface CountrySelectFieldProps extends SelectFieldProps {
  valueType?: "alpha2" | "numeric";
}

export function CountrySelectField({
  label,
  valueType = "alpha2",
  ...props
}: CountrySelectFieldProps) {
  const { getCountryOptions } = useCountries();
  const options = getCountryOptions(valueType);

  return <SelectField label={label} options={options} {...props} />;
}
