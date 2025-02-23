'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { CalendarIcon } from '@radix-ui/react-icons';
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  getAriaAttributes,
  type BaseFormInputProps,
  type WithPlaceholderProps,
} from './types';

type CalendarProps = Omit<
  ComponentPropsWithoutRef<typeof Calendar>,
  'mode' | 'selected' | 'onSelect'
>;

type FormDateProps<T extends FieldValues> = Omit<
  CalendarProps,
  keyof BaseFormInputProps<T>
> &
  BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** Minimum selectable date */
    fromDate?: Date;
    /** Maximum selectable date */
    toDate?: Date;
  };

const DEFAULT_TO_DATE = new Date(
  new Date().setFullYear(new Date().getFullYear() + 10)
);
const DEFAULT_PLACEHOLDER = 'Pick a date';

/**
 * A form date input component that wraps shadcn's Calendar component with form field functionality.
 * Provides a date picker with optional min/max date constraints and full form integration.
 *
 * @example
 * ```tsx
 * <AssetFormDate
 *   name="dueDate"
 *   control={form.control}
 *   label="Due Date"
 *   required
 *   fromDate={new Date()}
 * />
 * ```
 */
export function FormDate<T extends FieldValues>({
  label,
  description,
  required,
  placeholder = DEFAULT_PLACEHOLDER,
  fromDate = new Date(),
  toDate = DEFAULT_TO_DATE,
  className,
  ...props
}: FormDateProps<T>) {
  return (
    <FormField
      {...props}
      render={({ field, fieldState }) => {
        const ariaAttrs = getAriaAttributes(
          field.name,
          !!fieldState.error,
          props.disabled
        );

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel
                className={cn(
                  fieldState.error && 'text-destructive',
                  props.disabled && 'cursor-not-allowed opacity-70'
                )}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                      props.disabled && 'cursor-not-allowed opacity-70'
                    )}
                    {...ariaAttrs}
                  >
                    {field.value ? (
                      <time dateTime={field.value.toISOString()}>
                        {formatDate(field.value)}
                      </time>
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > toDate || date < fromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            {description && (
              <FormDescription id={`${field.name}-description`}>
                {description}
              </FormDescription>
            )}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}
