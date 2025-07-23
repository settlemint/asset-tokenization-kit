import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/use-form-contexts";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  label,
  description,
  required = false,
  options = [],
  placeholder,
}: SelectFieldProps) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <Select
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value);
        }}
      >
        <SelectTrigger
          id={field.name}
          className={errorClassNames(field.state.meta)}
        >
          <SelectValue placeholder={placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
