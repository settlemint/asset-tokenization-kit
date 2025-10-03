import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";
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
  className?: string;
}

export function RadioField({
  label,
  description,
  required = false,
  options = [],
  variant = "default",
  onSelect,
  className,
}: {
  label?: string;
  description?: string;
  required?: boolean;
  options?: RadioOption[];
  variant?: "default" | "card";
  onSelect?: (value: string) => void;
  className?: string;
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();

  const getGridClasses = () => {
    const optionCount = options.length;
    return cn(
      "grid gap-4",
      optionCount <= 1 && "grid-cols-1",
      optionCount === 2 && "grid-cols-2",
      optionCount >= 3 && "grid-cols-3"
    );
  };

  const currentValue = useStore(field.store, (s) => s.value);

  const renderCardRadio = () => (
    <RadioGroup
      value={currentValue ?? ""}
      onValueChange={(value) => {
        field.handleChange(value);
        onSelect?.(value);
      }}
      className={cn(getGridClasses(), className)}
    >
      {options.map((option) => (
        <div key={option.value} className="relative h-full">
          <RadioGroupItem
            value={option.value}
            id={`${field.name}-${option.value}`}
            className="sr-only"
          />
          <Label
            htmlFor={`${field.name}-${option.value}`}
            className={cn(
              "flex cursor-pointer select-none rounded-lg border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground transition-all h-full",
              currentValue === option.value &&
                "border-primary bg-primary/5 text-primary"
            )}
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
        onSelect?.(value);
      }}
      className={className}
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
