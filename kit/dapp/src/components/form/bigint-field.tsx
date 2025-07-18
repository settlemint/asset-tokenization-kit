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

export function BigIntField({
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
  const field = useFieldContext<bigint | undefined>();
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
        value={field.state.value?.toString()}
        type="text"
        onChange={(e) => {
          if (e.target.value === "") {
            field.handleChange(undefined);
          } else {
            field.handleChange(BigInt(e.target.value));
          }
        }}
        className={errorClassNames(field.state.meta)}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
