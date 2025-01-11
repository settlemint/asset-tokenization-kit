import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultipleSelector from '@/components/ui/multiselect';
import {} from '@radix-ui/react-select';
import { type VariantProps, cva } from 'class-variance-authority';
import { useRef } from 'react';
import type * as React from 'react';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface MultiSelectProps {
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

type MultiSelectInputProps<T extends FieldValues> = {
  label?: string;
  description?: string;
  showRequired?: boolean;
  entries: { value: string; label: string; disable?: boolean }[];
} & Omit<MultiSelectProps, 'name'> &
  VariantProps<typeof inputVariants> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required'>;
  };

export function MultiSelectInput<T extends FieldValues>({
  label,
  description,
  name,
  placeholder,
  control,
  className,
  showRequired,
  entries,
}: MultiSelectInputProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem ref={ref} className="FormItem relative z-20 w-full ">
            {label && (
              <FormLabel className="FormLabel mt-1 block text-foreground text-sm">
                <span>{label}</span>
                {showRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            <FormControl className={`${label ? '' : 'mt-2'} w-full`}>
              <MultipleSelector
                commandProps={{
                  label,
                }}
                value={(field.value || []).map((value) => ({
                  value,
                  label: entries.find((entry) => entry.value === value)?.label || value,
                }))}
                defaultOptions={entries}
                placeholder={placeholder}
                hideClearAllButton
                hidePlaceholderWhenSelected
                emptyIndicator={<p className="text-center text-sm">No results found</p>}
                onChange={(selectedItems) => {
                  field.onChange(selectedItems.map((item) => item.value));
                }}
              />
            </FormControl>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

MultiSelectInput.displayName = 'MultiSelectInput';
