import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, type InputProps } from '@/components/ui/input';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

type TextInputProps<T extends FieldValues> = {
  label?: string;
  description?: string;
} & Omit<InputProps, 'variant' | 'name'> & {
    name: Path<T>;
    control: Control<T>;
    shouldUnregister?: boolean;
    rules?: Pick<RegisterOptions<T, Path<T>>, 'required' | 'minLength' | 'maxLength' | 'pattern'>;
  };

export function TextInput<T extends FieldValues>({ label, description, name, control, ...props }: TextInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

TextInput.displayName = 'TextInput';
