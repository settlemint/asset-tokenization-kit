import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import { type Role, getRoleDisplayName } from '@/lib/config/roles';
import type { GrantRole } from '@/lib/mutations/stablecoin/grant-role';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<GrantRole>();
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep
      title="Review and confirm update proven collateral"
      description="Verify the details of your update proven collateral before proceeding."
    >
      <FormSummaryDetailCard
        title="Grant Role"
        description="Granting role operation details"
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Asset"
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label="Admin Address"
          value={<EvmAddress address={values.userAddress as Address} />}
        />
        <FormSummaryDetailItem
          label="Roles"
          value={
            <div className="flex flex-wrap gap-1">
              {Object.entries(values.roles ?? {})
                .filter(([, isEnabled]) => isEnabled)
                .map(([role]) => (
                  <span
                    key={role}
                    className="rounded bg-muted px-2 py-1 text-xs"
                  >
                    {getRoleDisplayName(role as Role)}
                  </span>
                ))}
            </div>
          }
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
