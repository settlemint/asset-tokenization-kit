import { FormLabel } from "@/components/form/tanstack-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/hooks/use-form-contexts";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";

interface RadioOption {
  value: string;
  label: string;
  description?: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
}

export function RadioField({
  label,
  description,
  required = false,
  options = [],
  variant = "default",
}: {
  label?: string;
  description?: string;
  required?: boolean;
  options?: RadioOption[];
  variant?: "default" | "card";
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  const getGridColumns = () => {
    const optionCount = options.length;
    if (optionCount <= 1) return "grid-cols-1";
    if (optionCount === 2) return "grid-cols-2";

    return "grid-cols-3"; // Use 3 columns for 3+ options
  };

  const renderCardRadio = () => (
    <RadioGroup
      value={field.state.value}
      onValueChange={(value) => {
        field.handleChange(value);
      }}
      className={`grid ${getGridColumns()} gap-4`}
    >
      {options.map((option) => (
        <div key={option.value} className="relative h-full">
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className="peer sr-only"
          />
          <FormLabel
            htmlFor={option.value}
            className="flex cursor-pointer select-none rounded-lg border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all h-full"
          >
            <div className="flex flex-col h-full p-4">
              {/* Header with icon and title */}
              <div className="flex items-center gap-2 mb-2">
                {option.icon && <option.icon className="h-5 w-5" />}
                <div className="text-base font-semibold capitalize">
                  {option.label}
                </div>
              </div>

              {/* Description - takes up available space */}
              {option.description && (
                <div className="text-sm text-muted-foreground mb-4 flex-1">
                  {option.description}
                </div>
              )}

              {/* Footer - always at bottom */}
              {option.footer && <div className="mt-auto">{option.footer}</div>}
            </div>
          </FormLabel>
        </div>
      ))}
    </RadioGroup>
  );

  const renderDefaultRadio = () => (
    <RadioGroup
      value={field.state.value}
      onValueChange={(value) => {
        field.handleChange(value);
      }}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={option.value} />
          <Label htmlFor={option.value} className="cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      {variant === "card" ? renderCardRadio() : renderDefaultRadio()}
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
