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

export function BigIntField({
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
  // The `Field` infers type based on usage - could be number or string
  const field = useFieldContext<bigint | undefined>();

  const renderInput = React.useCallback(
    ({ className }: { className?: string }) => (
      <Input
        id={field.name}
        value={field.state.value?.toString()}
        type="text"
        onChange={(e) => {
          try {
            field.handleChange(BigInt(e.target.value));
          } catch {
            field.handleChange(undefined);
          }
        }}
        className={cn(className, errorClassNames(field.state.meta))}
      />
    ),
    [field]
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
