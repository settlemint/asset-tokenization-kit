import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { TIME_INTERVAL_VALUES } from "@atk/zod/time-interval";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";
import { useTranslation } from "react-i18next";

export interface SelectTimeIntervalFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectTimeIntervalField({
  label,
  description,
  required = false,
  placeholder,
  disabled = false,
  className,
}: SelectTimeIntervalFieldProps) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  const { t } = useTranslation(["common"]);

  const options = TIME_INTERVAL_VALUES.map((interval) => ({
    label: t(`common:timeInterval.${interval}`),
    value: interval,
  }));

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <Select
        value={field.state.value}
        onValueChange={field.handleChange}
        disabled={disabled || field.state.meta.isValidating}
      >
        <SelectTrigger
          id={field.name}
          className={cn(errorClassNames(field.state.meta), className)}
        >
          <SelectValue placeholder={placeholder} />
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