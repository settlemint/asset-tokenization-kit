'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type * as React from 'react';
import type { ReactNode } from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

const inputVariants = cva('', {
  variants: {
    variant: {
      default: 'FormInput',
      icon: 'FormInput pl-8',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type CalendarInputProps<T extends FieldValues> = {
  label?: string;
  description?: string;
  icon?: ReactNode;
  showRequired?: boolean;
} & Omit<React.ComponentProps<'input'>, 'name'> &
  VariantProps<typeof inputVariants> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required' | 'minLength' | 'maxLength' | 'pattern'>;
  };

export function CalendarInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  showRequired,
  className,
}: CalendarInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('mt-5 flex flex-col', className)}>
          {label && (
            <FormLabel className="FormLabel">
              <span>{label}</span>
              {showRequired && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                >
                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
