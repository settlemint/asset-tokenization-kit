import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { BlockUserFormType } from '../schema';

export function Summary({
  address,
  userAddress,
  blocked,
}: { address: Address; userAddress: Address; blocked: boolean }) {
  const { control } = useFormContext<BlockUserFormType>();
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm {action}</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details before proceeding. This action will {blocked ? 'enable' : 'prevent'} token transfers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Contract Status</h3>
              <p className="text-muted-foreground text-xs">Current contract status and target state.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">User</dt>
              <dd className="font-medium text-sm">
                <EvmAddress address={userAddress} />
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Current State</dt>
              <dd className="font-medium text-sm">{blocked ? 'Blocked' : 'Active'}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Target State</dt>
              <dd className="font-medium text-sm">{blocked ? 'Active' : 'Blocked'}</dd>
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

          <AssetFormInput name="address" type="hidden" value={address} />
          <AssetFormInput name="userAddress" type="hidden" value={userAddress} />
          <AssetFormInput name="blocked" type="hidden" value={blocked ? 'true' : 'false'} />

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
