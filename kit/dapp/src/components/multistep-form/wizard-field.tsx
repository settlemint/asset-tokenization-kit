import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useField } from "@tanstack/react-form";
import { useCallback, useEffect, useState } from "react";
import type { FieldDefinition } from "./types";
import { useWizardContext } from "./wizard-context";

const logger = createLogger();

interface WizardFieldProps<TFormData> {
  fieldDef: FieldDefinition<TFormData>;
  formData: Partial<TFormData>;
}

export function WizardField<TFormData>({
  fieldDef,
  formData,
}: WizardFieldProps<TFormData>) {
  const [isVisible, setIsVisible] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const { form } = useWizardContext<TFormData>();

  // Always call useField hook - never conditionally
  const field = useField({
    form,
    name: fieldDef.name as string,
    validators: fieldDef.schema
      ? {
          onChange: ({ value }) => {
            const result = fieldDef.schema?.safeParse(value);
            return result?.success
              ? undefined
              : (result?.error.issues[0]?.message ?? "Invalid value");
          },
        }
      : undefined,
  });

  // Event handlers with useCallback to prevent function recreation
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(e.target.value as any);
    },
    [field]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(e.target.value as any);
    },
    [field]
  );

  const handleSelectChange = useCallback(
    (value: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(value as any);
    },
    [field]
  );

  const handleCheckboxChange = useCallback(
    (checked: boolean | "indeterminate") => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(checked as any);
    },
    [field]
  );

  const handleRadioChange = useCallback(
    (value: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(value as any);
    },
    [field]
  );

  // Check field visibility
  useEffect(() => {
    if (fieldDef.dependsOn) {
      const checkVisibility = async () => {
        setIsChecking(true);
        try {
          const shouldShow = await fieldDef.dependsOn?.(formData);
          setIsVisible(shouldShow ?? true);
        } catch (error) {
          logger.error("Error checking field dependency", {
            error,
            fieldName: fieldDef.name,
          });
          setIsVisible(true);
        } finally {
          setIsChecking(false);
        }
      };
      void checkVisibility();
    }
  }, [fieldDef, formData]);

  // Safety check for form
  if (!form) {
    return null;
  }

  if (!isVisible || isChecking) return null;

  // Custom component
  if (fieldDef.component) {
    const Component = fieldDef.component;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Component field={field as any} fieldDefinition={fieldDef} />;
  }

  const renderField = () => {
    switch (fieldDef.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              id={fieldDef.name as string}
              type={fieldDef.type}
              placeholder={fieldDef.placeholder}
              value={(field.state.value as string) ?? ""}
              onChange={handleInputChange}
              onBlur={field.handleBlur}
              className={cn(
                field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 &&
                  "border-destructive"
              )}
            />
            {fieldDef.postfix && (
              <span className="text-sm text-muted-foreground">
                {fieldDef.postfix}
              </span>
            )}
          </div>
        );

      case "textarea":
        return (
          <Textarea
            id={fieldDef.name as string}
            placeholder={fieldDef.placeholder}
            value={(field.state.value as string) ?? ""}
            onChange={handleTextareaChange}
            onBlur={field.handleBlur}
            className={cn(
              field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 &&
                "border-destructive"
            )}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={(field.state.value as string) ?? ""}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger
              id={fieldDef.name as string}
              className={cn(
                field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 &&
                  "border-destructive"
              )}
            >
              <SelectValue
                placeholder={fieldDef.placeholder ?? "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {fieldDef.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldDef.name as string}
              checked={(field.state.value as boolean) ?? false}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor={fieldDef.name as string}
              className="text-sm font-normal cursor-pointer"
            >
              {fieldDef.label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={(field.state.value as string) ?? ""}
            onValueChange={handleRadioChange}
          >
            {fieldDef.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {fieldDef.type !== "checkbox" && (
        <Label htmlFor={fieldDef.name as string}>
          {fieldDef.label}
          {fieldDef.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      {fieldDef.description && (
        <p className="text-sm text-muted-foreground">{fieldDef.description}</p>
      )}
      {renderField()}
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  );
}
