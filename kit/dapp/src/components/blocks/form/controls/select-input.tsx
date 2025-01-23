import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { type ReactElement, useRef } from 'react';
import type * as React from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: 'ltr' | 'rtl';
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  form?: string;
  placeholder?: string;
  className?: string;
}

const inputVariants = cva('', {
  variants: {
    variant: {
      default: 'FormInput',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type SelectInputProps<T extends FieldValues> = {
  label: string;
  description?: string;
  showRequired?: boolean;
  children: ReactElement<typeof SelectItem> | ReactElement<typeof SelectItem>[];
} & Omit<SelectProps, 'name'> &
  VariantProps<typeof inputVariants> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required'>;
  };

export function SelectInput<T extends FieldValues>({
  label,
  description,
  name,
  placeholder,
  control,
  className,
  showRequired,
  children,
  onValueChange,
}: SelectInputProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem ref={ref} className="FormItem relative z-10 mt-5 w-full">
            {label && (
              <FormLabel className="FormLabel block">
                <span>{label}</span>
                {showRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
              defaultValue={field.value}
            >
              <FormControl className="w-full">
                <SelectTrigger
                  style={{ outlineWidth: '0px' }}
                  className={cn(
                    'flex h-auto items-center justify-between rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm',
                    field.value ? 'text-foreground' : 'text-muted-foreground',
                    '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0',
                    className
                  )}
                >
                  <SelectValue placeholder={placeholder} className="!text-muted-foreground" />
                  <ChevronDown className="h-4 w-4" />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                style={{ width: ref.current?.getBoundingClientRect().width }}
                className={cn('rounded-md border bg-background', '[&_[data-highlighted]]:!bg-[hsl(var(--accent))]')}
              >
                {children}
              </SelectContent>
            </Select>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

SelectInput.displayName = 'SelectInput';
