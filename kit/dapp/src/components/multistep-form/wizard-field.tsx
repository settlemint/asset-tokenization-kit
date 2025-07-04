import { useEffect, useState } from "react";
import { useField } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { FieldDefinition } from "./types";
import { useWizardContext } from "./wizard-context";
import type { DeepValue } from "@tanstack/react-form";

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

  // Check field visibility
  useEffect(() => {
    if (fieldDef.dependsOn) {
      const checkVisibility = async () => {
        setIsChecking(true);
        try {
          const shouldShow = await fieldDef.dependsOn!(formData);
          setIsVisible(shouldShow);
        } catch (error) {
          console.error("Error checking field dependency:", error);
          setIsVisible(true);
        } finally {
          setIsChecking(false);
        }
      };
      void checkVisibility();
    }
  }, [fieldDef, formData]);

  // Safety check for form before creating field
  if (!form) {
    return null;
  }

  const field = useField({
    form,
    name: fieldDef.name as string,
    validators: fieldDef.schema
      ? {
          onChange: ({ value }) => {
            const result = fieldDef.schema!.safeParse(value);
            return result.success
              ? undefined
              : result.error.issues[0]?.message || "Invalid value";
          },
        }
      : undefined,
  });

  if (!isVisible || isChecking) return null;

  // Custom component
  if (fieldDef.component) {
    const Component = fieldDef.component;
    return <Component field={field} fieldDefinition={fieldDef} />;
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
              value={(field.state.value as string) || ""}
              onChange={(e) =>
                field.handleChange(
                  e.target.value as DeepValue<TFormData, string>
                )
              }
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
            value={(field.state.value as string) || ""}
            onChange={(e) =>
              field.handleChange(e.target.value as DeepValue<TFormData, string>)
            }
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
            value={(field.state.value as string) || ""}
            onValueChange={(value) => field.handleChange(value as any)}
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
                placeholder={fieldDef.placeholder || "Select an option"}
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
              checked={(field.state.value as boolean) || false}
              onCheckedChange={(checked) => field.handleChange(checked as any)}
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
            value={(field.state.value as string) || ""}
            onValueChange={(value) => field.handleChange(value as any)}
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
