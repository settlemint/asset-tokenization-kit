'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';

type CalendarProps = Omit<ComponentPropsWithoutRef<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;

type AssetFormDateProps<T extends FieldValues> = Omit<CalendarProps, keyof UseControllerProps<T>> &
  UseControllerProps<T> & {
    label?: string;
    description?: string;
    required?: boolean;
    placeholder?: string;
    fromDate?: Date;
    toDate?: Date;
  };

const DEFAULT_TO_DATE = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

/**
 * A form date input component that wraps shadcn's Calendar component with form field functionality.
 */
export function AssetFormDate<T extends FieldValues>({
  label,
  description,
  required,
  placeholder = 'Pick a date',
  fromDate = new Date(),
  toDate = DEFAULT_TO_DATE,
  ...props
}: AssetFormDateProps<T>) {
  return (
    <FormField
      {...props}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn(fieldState.error && 'text-destructive', props.disabled && 'cursor-not-allowed opacity-70')}
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
                  disabled={props.disabled}
                  id={field.name}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={`${field.name}-error ${field.name}-description ${field.name}-label`}
                  aria-disabled={props.disabled}
                >
                  {field.value ? format(field.value, 'PPP') : <span>{placeholder}</span>}
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
          {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
          <FormMessage id={`${field.name}-error`} aria-live="polite" />
        </FormItem>
      )}
    />
  );
}
