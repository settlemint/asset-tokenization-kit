import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
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
  const [dateOpen, setDateOpen] = useState(false);
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

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field.handleChange(e.target.value as any);
    },
    [field]
  );

  const handleDateTimeSelectChange = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const selectedDate = field.state.value as Date | undefined;
        const hoursFromTimeInput = selectedDate?.getHours() ?? 0;
        const minutesFromTimeInput = selectedDate?.getMinutes() ?? 0;

        const newDate = new Date(date);
        newDate.setHours(hoursFromTimeInput, minutesFromTimeInput, 0, 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field.handleChange(newDate as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field.handleChange(undefined as any);
      }
      setDateOpen(false);
    },
    [field, setDateOpen]
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      const selectedDate = field.state.value as Date | undefined;
      if (time && selectedDate) {
        const [hours, minutes] = time.split(":").map(Number);
        if (hours !== undefined && minutes !== undefined) {
          const newDate = new Date(selectedDate);
          newDate.setHours(hours, minutes, 0, 0);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field.handleChange(newDate as any);
        }
      }
    },
    [field]
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (fieldDef.minDate && date < fieldDef.minDate) return true;
      if (fieldDef.maxDate && date > fieldDef.maxDate) return true;
      return false;
    },
    [fieldDef.minDate, fieldDef.maxDate]
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
              value={(field.state.value as string) || ""}
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

      case "date":
        return (
          <div className="flex items-center gap-2">
            <Input
              id={fieldDef.name as string}
              type="date"
              placeholder={fieldDef.placeholder}
              value={(field.state.value as string) || ""}
              onChange={handleDateChange}
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

      case "datetime": {
        const selectedDate = field.state.value as Date | undefined;

        return (
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id={fieldDef.name as string}
                    className={cn(
                      "justify-between font-normal",
                      !selectedDate && "text-muted-foreground",
                      field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0 &&
                        "border-destructive"
                    )}
                  >
                    <span className="flex items-center">
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : (fieldDef.placeholder ?? "Select date")}
                    </span>
                    <CalendarDays className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    startMonth={fieldDef.minDate ?? undefined}
                    endMonth={fieldDef.maxDate ?? undefined}
                    onSelect={handleDateTimeSelectChange}
                    disabled={isDateDisabled}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Input
                type="time"
                step="60"
                value={
                  selectedDate
                    ? selectedDate.toTimeString().slice(0, 5)
                    : "10:30"
                }
                onChange={handleTimeChange}
                className={cn(
                  "w-[120px] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                  !selectedDate && "text-muted-foreground",
                  field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 &&
                    "border-destructive"
                )}
              />
            </div>

            {fieldDef.postfix && (
              <span className="text-sm text-muted-foreground self-end pb-2">
                {fieldDef.postfix}
              </span>
            )}
          </div>
        );
      }

      case "textarea":
        return (
          <Textarea
            id={fieldDef.name as string}
            placeholder={fieldDef.placeholder}
            value={(field.state.value as string) || ""}
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
            value={(field.state.value as string) || ""}
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
              checked={(field.state.value as boolean) || false}
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
        if (fieldDef.variant === "card") {
          return (
            <RadioGroup
              value={(field.state.value as string) || ""}
              onValueChange={handleRadioChange}
              className="grid grid-cols-3 gap-4"
            >
              {fieldDef.options?.map((option) => (
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
                        <div className="flex-shrink-0 mt-0.5">
                          {option.icon}
                        </div>
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
        }
        return (
          <RadioGroup
            value={(field.state.value as string) || ""}
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
      {fieldDef.type !== "checkbox" && fieldDef.label && (
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
