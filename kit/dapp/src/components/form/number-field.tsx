import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { useMemo } from "react";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
  withPostfix,
} from "./field";

export function NonNegativeNumberField({
  label,
  postfix,
  description,
  required = false,
}: {
  label: string;
  postfix?: string;
  description?: string;
  required?: boolean;
}) {
  // The `Field` infers type based on usage - could be number or string
  const field = useFieldContext<number | string>();
  const InputWithPostfix = useMemo(
    () => withPostfix(Input, postfix),
    [postfix]
  );

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <InputWithPostfix
        id={field.name}
        value={field.state.value}
        type="number"
        inputMode="decimal"
        onChange={(e) => {
          field.handleChange(e.target.valueAsNumber);
        }}
        className={errorClassNames(field.state.meta)}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
