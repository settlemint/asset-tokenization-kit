import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { Role } from '@/lib/config/roles';
import { getRoleDisplayName } from '@/lib/config/roles';
import { Lock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { AddTokenAdminFormType } from '../schema';

export function Summary({ address }: { address: Address }) {
  const { control } = useFormContext<AddTokenAdminFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm new admin roles</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details before proceeding. This action will grant admin roles to the specified address.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Admin Details</h3>
              <p className="text-muted-foreground text-xs">Review the new admin address and roles to be granted.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Token Address</dt>
              <dd className="font-medium text-sm">
                <EvmAddress address={address} />
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">New Admin Address</dt>
              <dd className="font-medium text-sm">
                <EvmAddress address={values.userAddress as Address} />
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Roles to Grant</dt>
              <dd className="font-medium text-sm">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(values.roles ?? {})
                    .filter(([_, isEnabled]) => isEnabled)
                    .map(([role]) => (
                      <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
                        {getRoleDisplayName(role as Role)}
                      </span>
                    ))}
                </div>
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
