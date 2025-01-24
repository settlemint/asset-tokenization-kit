import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
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

const iconVariants = cva('absolute', {
  variants: {
    variant: {
      default: 'InputIcon hidden',
      icon: 'InputIcon top-4 left-2 flex h-[1.2rem] w-[1.2rem] items-center justify-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type CheckboxInputProps<T extends FieldValues> = {
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

export function CheckboxInput<T extends FieldValues>({
  variant,
  label,
  description,
  icon,
  name,
  control,
  className,
  showRequired,
}: CheckboxInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('FormItem relative mt-4', className)}>
          {icon && <FormLabel className={iconVariants({ variant })}>{icon}</FormLabel>}
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className={cn(inputVariants({ variant }), className)}
            />
          </FormControl>
          {label && (
            <FormLabel className="FormLabel ml-2">
              <span className="-translate-y-1 inline-block">{label}</span>
              {showRequired && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          {description && <FormDescription className="-translate-y-2 ml-6">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

CheckboxInput.displayName = 'CheckboxInput';
