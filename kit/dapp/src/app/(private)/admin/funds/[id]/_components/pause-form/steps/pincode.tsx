import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { PauseFundFormType } from '../schema';

export function Pincode() {
  const { control } = useFormContext<PauseFundFormType>();

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
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field} className="justify-center gap-1.5">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-8 w-8" />
                    <InputOTPSlot index={1} className="h-8 w-8" />
                    <InputOTPSlot index={2} className="h-8 w-8" />
                    <InputOTPSlot index={3} className="h-8 w-8" />
                    <InputOTPSlot index={4} className="h-8 w-8" />
                    <InputOTPSlot index={5} className="h-8 w-8" />
                  </InputOTPGroup>
                </InputOTP>
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
