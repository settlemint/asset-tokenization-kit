import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

type NumericInputProps<T extends FieldValues> = {
  label?: string;
  description?: string;
  showRequired?: boolean;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  className?: string;
  rules?: RegisterOptions;
  addonRight?: string;
};

export function NumericInput<T extends FieldValues>({
  label,
  description,
  name,
  control,
  className,
  showRequired,
  placeholder,
  addonRight,
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
              <div className="flex rounded-lg shadow-black/5 shadow-sm">
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
                  className={cn(className, `${addonRight ? '-me-px rounded-e-none shadow-none focus:mr-[1px]' : ''} `)}
                />
                {addonRight && (
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm ">
                    {addonRight}
                  </span>
                )}
              </div>
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
