import { AssetProperty } from '@/components/blocks/asset-form/asset-property';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Lock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { BlockUserFormType } from '../schema';

export function Summary({ userAddress, blocked }: { userAddress: Address; blocked: boolean }) {
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
            <AssetProperty label="User" value={userAddress} type="address" />
            <AssetProperty label="Current State" value={blocked ? 'Blocked' : 'Active'} />
            <AssetProperty label="Target State" value={blocked ? 'Active' : 'Blocked'} />
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
