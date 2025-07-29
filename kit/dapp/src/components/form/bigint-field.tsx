import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
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

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <div className="relative">
        <Input
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
          className={cn(
            "peer",
            startAddon && "ps-6",
            endAddon && "pe-12",
            errorClassNames(field.state.meta)
          )}
        />
        {startAddon && (
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
            {startAddon}
          </span>
        )}
        {endAddon && (
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
            {endAddon}
          </span>
        )}
      </div>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
