'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Ban, Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { BlockHolderFormType } from '../schema';

export function Summary({ address, holder, blocked }: { address: Address; holder: Address; blocked: boolean }) {
  const { control } = useFormContext<BlockHolderFormType>();
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm {action}</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details before proceeding. This action will {blocked ? 'enable' : 'prevent'} token transfers for
          this holder.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Ban className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Holder Status</h3>
              <p className="text-muted-foreground text-xs">Current holder status and target state.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Contract Address</dt>
              <dd className="font-medium text-sm">{address}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Holder Address</dt>
              <dd className="font-medium text-sm">{holder}</dd>
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
