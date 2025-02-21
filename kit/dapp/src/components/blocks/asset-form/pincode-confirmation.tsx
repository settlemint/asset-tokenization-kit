import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Lock } from 'lucide-react';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface PincodeConfirmationProps<T extends FieldValues> {
  control: Control<T>;
  name?: Path<T>;
}

export function PincodeConfirmation<T extends FieldValues>({
  control,
  name = 'pincode' as Path<T>,
}: PincodeConfirmationProps<T>) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-3 w-3 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Security Confirmation</h3>
          <p className="text-muted-foreground text-xs">Enter your pin code to confirm and sign the transaction.</p>
        </div>
      </div>

      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <OTPInput value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

PincodeConfirmation.validatedFields = ['pincode'] as const;
