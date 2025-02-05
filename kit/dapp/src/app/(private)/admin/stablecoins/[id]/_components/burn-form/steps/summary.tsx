import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { DollarSign, Lock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { BurnStablecoinFormType } from '../schema';
export function Summary({ address }: { address: Address }) {
  const { control } = useFormContext<BurnStablecoinFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm Burn</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details of your burn before proceeding. Ensure the recipient and amount are correct.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Asset Basics</h3>
              <p className="text-muted-foreground text-xs">Basic asset information and settings.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Name</dt>
              <dd className="font-medium text-sm">{values.address}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Amount</dt>
              <dd className="font-medium text-sm">{values.amount}</dd>
            </div>
          </dl>
        </div>

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

          <AssetFormInput control={control} name="address" label="Address" type="hidden" defaultValue={address} />
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
    </div>
  );
}

Summary.validatedFields = ['pincode'] as const;
