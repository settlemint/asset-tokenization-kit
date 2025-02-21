import { AssetProperty } from '@/components/blocks/asset-form/asset-property';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { type Role, getRoleDisplayName } from '@/lib/config/roles';
import { Lock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { EditRolesFormType } from '../schema';

export function Summary({ userAddress, currentRoles: roles }: { userAddress: Address; currentRoles: Role[] }) {
  const { control } = useFormContext<EditRolesFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Review and confirm new roles.</h2>
        <p className="text-muted-foreground text-xs">
          Verify the details before proceeding. This action will change the roles for the user.
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
            <AssetProperty
              label="Current roles"
              value={roles.map((role: Role) => getRoleDisplayName(role)).join(', ')}
            />
            <AssetProperty
              label="New roles"
              value={Object.entries(values.newRoles ?? {})
                .filter(([_, isEnabled]) => isEnabled)
                .map(([role]) => (
                  <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
                    {getRoleDisplayName(role as Role)}
                  </span>
                ))
                .join(', ')}
            />
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
