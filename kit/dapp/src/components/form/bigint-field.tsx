import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { formatUnits, parseUnits } from "viem";
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
  decimals = 0,
}: {
  label: string;
  startAddon?: string;
  endAddon?: string;
  description?: string;
  required?: boolean;
  /** Number of decimal places supported (defaults to 0 for plain integers) */
  decimals?: number;
}) {
  // The `Field` infers type based on usage - could be number or string
  const field = useFieldContext<bigint | undefined>();

  // Convert BigInt to decimal string for display
  const displayValue = field.state.value === undefined 
    ? ""
    : formatUnits(field.state.value, decimals);

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {({ className }) => (
          <Input
            id={field.name}
            value={displayValue}
            type="text"
            inputMode="decimal"
            onChange={(e) => {
              const value = e.target.value.trim();
              
              // Allow empty input
              if (value === "") {
                field.handleChange(undefined);
                return;
              }

              try {
                // Use parseUnits to convert decimal string to BigInt with proper scaling
                const bigintValue = parseUnits(value, decimals);
                field.handleChange(bigintValue);
              } catch {
                // If parsing fails (invalid format), set to undefined
                field.handleChange(undefined);
              }
            }}
            className={cn(className, errorClassNames(field.state.meta))}
          />
        )}
      </FieldWithAddons>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
