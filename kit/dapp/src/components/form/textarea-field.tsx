import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "@/hooks/use-form-contexts";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";

export function TextAreaField({
  label,
  rows = 4,
  description,
  required = false,
}: {
  label: string;
  rows?: number;
  description?: string;
  required?: boolean;
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <Textarea
        id={field.name}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
        className={errorClassNames(field.state.meta)}
        rows={rows}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
