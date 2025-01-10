import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import './text-input.css';

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
      icon: 'InputIcon top-8 left-2 flex h-[1.2rem] w-[1.2rem] items-center justify-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type TextInputProps<T extends FieldValues> = {
  label: string;
  description?: string;
  icon?: ReactNode;
  showRequired?: boolean;
} & Omit<InputProps, 'name'> &
  VariantProps<typeof inputVariants> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required' | 'minLength' | 'maxLength' | 'pattern'>;
  };

export function TextInput<T extends FieldValues>({
  variant,
  label,
  description,
  icon,
  name,
  control,
  className,
  showRequired,
  ...props
}: TextInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="FormItem relative">
          {label && (
            <FormLabel className="FormLabel">
              <span>{label}</span>
              {showRequired && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          {icon && <FormLabel className={iconVariants({ variant })}>{icon}</FormLabel>}
          <FormControl>
            <Input {...field} {...props} className={cn(inputVariants({ variant }), className)} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

TextInput.displayName = 'TextInput';
