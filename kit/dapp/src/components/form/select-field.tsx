import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
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
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  description,
  required = false,
  options = [],
  placeholder,
  disabled = false,
  className,
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
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          className={cn(errorClassNames(field.state.meta), "w-full", className)}
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
