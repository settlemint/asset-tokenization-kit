import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
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

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {({ className }) => (
          <Input
            type="text"
            id={field.name}
            value={field.state.value}
            onChange={(e) => {
              field.handleChange(e.target.value);
            }}
            className={cn(className, errorClassNames(field.state.meta))}
          />
        )}
      </FieldWithAddons>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
