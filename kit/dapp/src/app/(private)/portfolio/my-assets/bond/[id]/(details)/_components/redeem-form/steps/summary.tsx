import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { formatNumber } from '@/lib/number';
import { DollarSign, Lock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { RedeemFormType } from '../schema';

export function Summary({ address, decimals }: { address: Address; decimals: number }) {
  const { control } = useFormContext<RedeemFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm Redemption</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details of the redemption before proceeding. Make sure the amount is correct.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Redemption details</h3>
              <p className="text-muted-foreground text-xs">Details of the redemption you are about to perform.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Bond Contract</dt>
              <dd className="font-medium text-sm">
                <EvmAddress address={address} />
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Amount</dt>
              <dd className="font-medium text-sm">{formatNumber(values.amount ?? 0)}</dd>
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

          <AssetFormInput control={control} name="address" type="hidden" defaultValue={address} />
          <AssetFormInput control={control} name="decimals" type="hidden" defaultValue={decimals} />

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
    </div>
  );
}

Summary.validatedFields = ['pincode'] as const;
