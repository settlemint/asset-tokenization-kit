import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import React from "react";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
  FieldWithAddons,
} from "./field";

export function TextField({
  label,
  startAddon,
  endAddon,
  description,
  required = false,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  startAddon?: string;
  endAddon?: string;
  description?: string;
  required?: boolean;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  autoComplete?: string;
  placeholder?: string;
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(e.target.value);
    },
    [field]
  );

  const handleBlur = React.useCallback(() => {
    field.handleBlur();
  }, [field]);

  const errorClass = React.useMemo(() => {
    return errorClassNames({
      isTouched: field.state.meta.isTouched,
      errors: field.state.meta.errors,
    });
  }, [field.state.meta.isTouched, field.state.meta.errors]);

  const renderInput = React.useCallback(
    ({ className }: { className?: string }) => {
      return (
        <Input
          type={type}
          id={field.name}
          value={field.state.value ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(className, errorClass)}
        />
      );
    },
    [
      type,
      autoComplete,
      placeholder,
      field.name,
      field.state.value,
      handleChange,
      handleBlur,
      errorClass,
    ]
  );

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {renderInput}
      </FieldWithAddons>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
