import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { type ReactNode } from "react";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "./field";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export function RadioField({
  label,
  description,
  required = false,
  options = [],
  variant = "default",
}: {
  label: string;
  description?: string;
  required?: boolean;
  options?: RadioOption[];
  variant?: "default" | "card";
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  const renderCardRadio = () => (
    <RadioGroup
      value={field.state.value}
      onValueChange={(value) => {
        field.handleChange(value);
      }}
      className="grid grid-cols-3 gap-4"
    >
      {options.map((option) => (
        <div key={option.value} className="relative h-full">
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className="peer sr-only"
          />
          <Label
            htmlFor={option.value}
            className="flex cursor-pointer select-none rounded-lg border border-input bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all h-full"
          >
            <div className="flex items-start space-x-3 h-full">
              {option.icon && (
                <div className="flex-shrink-0 mt-0.5">{option.icon}</div>
              )}
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="text-sm font-medium leading-6 mb-1">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-muted-foreground flex-1">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </Label>
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
