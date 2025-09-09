import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { normalizeDecimalInput } from "@/lib/utils/normalize-decimal-input";
import type { Dnum } from "dnum";
import { format, from } from "dnum";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
  FieldWithAddons,
} from "./field";

export function DnumField({
  label,
  startAddon,
  endAddon,
  description,
  required = false,
  decimals,
  placeholder,
}: {
  label: string;
  startAddon?: string;
  endAddon?: string;
  description?: string;
  required?: boolean;
  decimals: number;
  placeholder?: Dnum;
}) {
  const field = useFieldContext<Dnum | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { i18n } = useTranslation();
  const { language } = i18n;
  const [displayValue, setDisplayValue] = useState(() =>
    field.state.value ? format(field.state.value, { locale: language }) : ""
  );

  const validateAndConvert = useCallback(
    (value: string): Dnum | undefined => {
      try {
        // Normalize input based on user's locale before parsing
        const normalized = normalizeDecimalInput(value, language);
        const dnum = from(normalized, decimals);
        return dnum;
      } catch {
        return undefined;
      }
    },
    [decimals, language]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow empty input
      if (input === "") {
        setDisplayValue("");
        field.handleChange(undefined);
        return;
      }

      // Update display immediately for responsive feel
      setDisplayValue(input);

      // Try to convert to dnum - let the catch handle invalid cases
      const dnumValue = validateAndConvert(input);
      field.handleChange(dnumValue);
    },
    [field, validateAndConvert]
  );

  const handleBlur = useCallback(() => {
    // Format the display value on blur if we have a valid dnum
    if (field.state.value) {
      const formatted = format(field.state.value, {
        locale: language,
      });
      setDisplayValue(formatted);
    } else if (displayValue && displayValue !== "0") {
      // Clear invalid display values
      setDisplayValue("");
    }
  }, [field.state.value, displayValue, language]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow all navigation and control keys
      if (
        e.key.length > 1 || // Multi-character keys (Arrow, Backspace, etc.)
        e.ctrlKey ||
        e.metaKey || // Cmd key on Mac
        e.altKey
      ) {
        return;
      }

      // Block letters (except when used with modifiers above)
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      // Let the parsing logic handle the rest
    },
    []
  );

  const localizedPlaceholder = useMemo(() => {
    const dnumPlaceholder = placeholder ?? from(10_500.25, decimals);
    return format(dnumPlaceholder, {
      locale: language,
    });
  }, [placeholder, decimals, language]);

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {({ className }) => (
          <Input
            ref={inputRef}
            id={field.name}
            value={displayValue}
            type="text"
            inputMode="decimal"
            placeholder={localizedPlaceholder}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(className, errorClassNames(field.state.meta))}
          />
        )}
      </FieldWithAddons>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
