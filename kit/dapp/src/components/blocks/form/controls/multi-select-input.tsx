import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultipleSelector from '@/components/ui/multiselect';
import {} from '@radix-ui/react-select';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
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
  zIndex?: number;
  entries: { value: string; label: string; disable?: boolean }[];
  onButtonClick?: () => void;
  buttonIcon?: React.ReactNode;
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
  zIndex,
  onButtonClick,
  buttonIcon,
}: MultiSelectInputProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem ref={ref} className="FormItem relative z-20 w-full" style={{ zIndex }}>
            {label && (
              <FormLabel className="FormLabel mt-1 block text-foreground text-sm">
                <span>{label}</span>
                {showRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}

            <FormControl className={`${label ? '' : 'mt-2'} w-full`}>
              <div className="flex">
                <MultipleSelector
                  className={`${buttonIcon ? 'rounded-e-none ' : ''}`}
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
                {onButtonClick && (
                  <button
                    type="button"
                    className="inline-flex aspect-square w-10 items-center justify-center self-end rounded-e-lg border border-input bg-background text-muted-foreground/80 text-sm outline-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      onButtonClick();
                    }}
                  >
                    {buttonIcon}
                  </button>
                )}
              </div>
            </FormControl>
            <ChevronDown
              className={`pointer-events-none absolute top-1 h-4 w-4 cursor-pointer ${buttonIcon ? 'right-12' : 'right-3'}`}
            />

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

MultiSelectInput.displayName = 'MultiSelectInput';
