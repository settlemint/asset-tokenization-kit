import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
  withPostfix,
} from "./field";

export function TextField({
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
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  const InputWithPostfix = withPostfix(Input, postfix);

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <InputWithPostfix
        type="text"
        id={field.name}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
        className={errorClassNames(field.state.meta)}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
