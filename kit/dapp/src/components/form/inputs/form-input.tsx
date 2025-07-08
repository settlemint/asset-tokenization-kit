import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  useCallback,
} from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  type BaseFormInputProps,
  type WithPostfixProps,
  type WithTextOnlyProps,
  getAriaAttributes,
} from "./types";
import { handleNumberInput, deriveValidationRules } from "./input-handlers";

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type FormInputProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T>
> &
  BaseFormInputProps<T> &
  WithPostfixProps &
  WithTextOnlyProps;

/**
 * A form input component that wraps shadcn's Input component with form field functionality.
 * Supports various input types including text, number, and email with built-in validation.
 *
 * @example
 * ```tsx
 * <AssetFormInput
 *   name="email"
 *   control={form.control}
 *   label="Email"
 *   type="email"
 *   required
 * />
 * ```
 */
export function FormInput<T extends FieldValues>({
  label,
  rules,
  description,
  postfix,
  className,
  textOnly,
  disabled,
  ...props
}: FormInputProps<T>) {
  const form = useFormContext<T>();
  const { register } = form;
  const { t } = useTranslation("form");

  const onInputChange = useCallback(
    (field: ControllerRenderProps<T, Path<T>>, inputProps: InputProps) => {
      return async (evt: ChangeEvent<HTMLInputElement>) => {
        if (inputProps.type === "number") {
          handleNumberInput(
            evt.target.value,
            field,
            { min: inputProps.min as number, max: inputProps.max as number },
            async () => form.trigger(field.name)
          );
        } else {
          field.onChange(evt);
          if (!inputProps.required && evt.target.value === "") {
            form.clearErrors(field.name);
          } else if (form.formState.errors[field.name]) {
            await form.trigger(field.name);
          }
        }

        // Chain the external onChange handler if provided
        if (inputProps.onChange) {
          inputProps.onChange(evt);
        }
      };
    },
    [form]
  );

  const renderField = useCallback(
    ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<T, Path<T>>;
      fieldState: ControllerFieldState;
    }) => {
      const inputProps = props;

      return (
        <FormItem className="flex flex-col space-y-1">
          {label && (
            <FormLabel
              className={cn(disabled && "cursor-not-allowed opacity-70")}
              htmlFor={field.name}
              id={`${field.name}-label`}
            >
              <span>
                {label}
                {inputProps.required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </span>
            </FormLabel>
          )}
          <FormControl>
            <div
              className={cn(
                "flex rounded-lg shadow-black/5 shadow-xs",
                !postfix && "shadow-none"
              )}
            >
              <Input
                {...register(field.name, {
                  valueAsNumber: inputProps.type === "number",
                })}
                {...field}
                {...inputProps}
                className={cn(
                  className,
                  postfix && "-mr-px rounded-r-none shadow-none focus:mr-[1px]"
                )}
                type={inputProps.type}
                value={
                  inputProps.defaultValue ? undefined : (field.value ?? "")
                }
                onChange={onInputChange(field, inputProps)}
                inputMode={inputProps.type === "number" ? "decimal" : "text"}
                {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
                disabled={disabled}
              />
              {postfix && (
                <span
                  className={cn(
                    "flex items-center bg-transparent text-sm text-foreground rounded-r-md px-3",
                    fieldState.error
                      ? "border-destructive bg-destructive/10"
                      : "bg-muted/50"
                  )}
                >
                  {postfix}
                </span>
              )}
            </div>
          </FormControl>
          {description && (
            <FormDescription id={`${field.name}-description`}>
              {description}
            </FormDescription>
          )}
        </FormItem>
      );
    },
    [
      className,
      description,
      disabled,
      label,
      onInputChange,
      postfix,
      props,
      register,
    ]
  );

  const translate = useCallback((key: string) => t(key), [t]);

  const validationRules = deriveValidationRules(
    props.type,
    textOnly,
    props.required,
    translate
  );

  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...validationRules,
      }}
      render={renderField}
    />
  );
}
