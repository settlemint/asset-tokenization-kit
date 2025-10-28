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
  disabled?: boolean;
  disabledLabel?: string;
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

  // Field store is the authoritative selection state.
  const activeValue = currentValue ?? "";

  // Allow callers to override selection behaviour (e.g. toggle cards) while keeping default radio semantics intact.
  const handleOptionSelect = (option: RadioOption, nextSelected = true) => {
    const isDisabled = option.disabled ?? false;
    if (isDisabled) {
      return;
    }

    if (!nextSelected) {
      field.handleChange("");
      onSelect?.("");
      return;
    }

    if (activeValue !== option.value) {
      field.handleChange(option.value);
      onSelect?.(option.value);
    }
  };

  const renderCardRadio = () => (
    <RadioGroup
      value={activeValue}
      onValueChange={(value) => {
        const option = options.find((opt) => opt.value === value);
        if (!option) {
          return;
        }
        handleOptionSelect(option, true);
      }}
      className={cn(getGridClasses(), className)}
    >
      {options.map((option) => {
        const isDisabled = option.disabled ?? false;
        const showDisabledMessage = isDisabled && option.disabledLabel;
        const isSelected = activeValue === option.value;

        return (
          <div key={option.value} className="relative h-full">
            <RadioGroupItem
              value={option.value}
              id={`${field.name}-${option.value}`}
              className="sr-only"
              disabled={isDisabled}
            />
            {/* Override default label behaviour so the shared handler can gate disabled/required logic while the underlying Radix radio maintains aria-checked/aria-disabled semantics. */}
            <Label
              htmlFor={`${field.name}-${option.value}`}
              onClick={(event) => {
                event.preventDefault();
                handleOptionSelect(option);
              }}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  handleOptionSelect(option);
                }
              }}
              // Required options must remain keyboard-focusable; only explicit disables exit the tab order.
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}
              className={cn(
                "flex select-none rounded-lg border border-input bg-background transition-all h-full",
                isDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-accent/50 hover:text-accent-foreground",
                isSelected && "border-primary bg-primary/5 text-primary",
                option.className
              )}
            >
              <div className="flex flex-col h-full p-4">
                <div className="flex items-center gap-2 mb-2">
                  {option.icon && <option.icon className="h-5 w-5" />}
                  <div className="text-base font-semibold capitalize">
                    {option.label}
                  </div>
                  {showDisabledMessage && (
                    <span className="text-xs text-muted-foreground">
                      {option.disabledLabel}
                    </span>
                  )}
                </div>

                {option.description && (
                  <div className="text-sm text-muted-foreground mb-4 flex-1">
                    {option.description}
                  </div>
                )}

                {option.footer && (
                  <div className="mt-auto">{option.footer}</div>
                )}
              </div>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderDefaultRadio = () => (
    <RadioGroup
      value={activeValue}
      onValueChange={(value) => {
        const option = options.find((opt) => opt.value === value);
        if (!option) {
          field.handleChange(value);
          onSelect?.(value);
          return;
        }
        handleOptionSelect(option, true);
      }}
      className={className}
    >
      {options.map((option) => {
        const isDisabled = option.disabled ?? false;

        return (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${field.name}-${option.value}`}
              disabled={isDisabled}
            />
            <Label
              htmlFor={`${field.name}-${option.value}`}
              className={cn(
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              )}
            >
              {option.label}
            </Label>
          </div>
        );
      })}
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
