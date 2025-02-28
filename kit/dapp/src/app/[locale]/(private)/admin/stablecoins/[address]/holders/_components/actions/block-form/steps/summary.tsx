import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { BlockUserInput } from '@/lib/mutations/stablecoin/block-user/block-user-schema';
import { DollarSign } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
  isCurrentlyBlocked: boolean;
}

export function Summary({ address, isCurrentlyBlocked }: SummaryProps) {
  const { control } = useFormContext<BlockUserInput>();

  return (
    <FormStep
      title="Review and confirm update proven collateral"
      description="Verify the details of your update proven collateral before proceeding."
    >
      <FormSummaryDetailCard
        title="Block"
        description="Blocking operation details"
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Asset"
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label="Current state"
          value={isCurrentlyBlocked ? 'Blocked' : 'Active'}
        />
        <FormSummaryDetailItem
          label="Target state"
          value={isCurrentlyBlocked ? 'Active' : 'Blocked'}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
