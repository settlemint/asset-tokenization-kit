import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { PauseEquityFormType } from '../schema';

export function Pincode() {
  const { control } = useFormContext<PauseEquityFormType>();

  return (
    <div className="space-y-6">
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
          name="pincode"
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
    </div>
  );
}

Pincode.validatedFields = ['pincode'] as const;
