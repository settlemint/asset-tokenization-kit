import { Checkbox } from "@/components/ui/checkbox";
import { useFieldContext } from "@/hooks/use-form-contexts";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";

export function CheckboxField({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  // The `Field` infers that it should have a `value` type of `boolean`
  const field = useFieldContext<boolean>();

  return (
    <FieldLayout>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => {
            if (checked === "indeterminate") {
              field.handleChange(false);
            } else {
              field.handleChange(checked);
            }
          }}
        />
        <FieldLabel
          htmlFor={field.name}
          label={label}
          className="text-sm font-normal cursor-pointer"
        />
      </div>
      <FieldDescription description={description} />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
