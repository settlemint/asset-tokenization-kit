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

export function NumberField({
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
  const field = useFieldContext<number>();

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {({ className }) => (
          <Input
            id={field.name}
            value={field.state.value}
            type="number"
            inputMode="decimal"
            onChange={(e) => {
              field.handleChange(e.target.valueAsNumber);
            }}
            className={cn(className, errorClassNames(field.state.meta))}
          />
        )}
      </FieldWithAddons>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
