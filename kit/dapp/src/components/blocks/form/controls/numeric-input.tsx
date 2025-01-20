import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Control, FieldValues, Path } from 'react-hook-form';

type NumericInputProps<T extends FieldValues> = {
  label: string;
  description?: string;
  showRequired?: boolean;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  className?: string;
};

export function NumericInput<T extends FieldValues>({
  label,
  description,
  name,
  control,
  className,
  showRequired,
  placeholder,
  ...props
}: NumericInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const _value = field.value === '' ? undefined : Number(field.value);
        return (
          <FormItem className={cn('FormItem relative mt-4', className)}>
            {label && (
              <FormLabel className="FormLabel">
                <span>{label}</span>
                {showRequired && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <Input
                {...field}
                {...props}
                type="number"
                placeholder={placeholder}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  field.onChange(value);
                }}
                value={Number.isNaN(_value) ? 0 : _value}
                className={className}
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

NumericInput.displayName = 'NumericInput';
