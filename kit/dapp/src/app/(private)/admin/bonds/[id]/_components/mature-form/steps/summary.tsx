import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { DollarSign, Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { MatureFormType } from '../schema';

export function Summary({ address }: { address: Address }) {
  const { control } = useFormContext<MatureFormType>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm Bond Maturation</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details of your bond maturation before proceeding. This action will mature your bond and release
          the principal and any accrued interest.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Action details</h3>
              <p className="text-muted-foreground text-xs">Details of the action you are about to perform.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Bond</dt>
              <dd className="font-medium text-sm">
                <EvmAddress address={address} />
              </dd>
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
