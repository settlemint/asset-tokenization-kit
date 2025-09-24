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
}: {
  label: string;
  startAddon?: string;
  endAddon?: string;
  description?: string;
  required?: boolean;
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(e.target.value);
    },
    [field]
  );

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
          type="text"
          id={field.name}
          value={field.state.value ?? ""}
          onChange={handleChange}
          className={cn(className, errorClass)}
        />
      );
    },
    [field.name, field.state.value, handleChange, errorClass]
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
