import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { Pause } from '@/lib/mutations/stablecoin/pause';
import type { UnPause } from '@/lib/mutations/stablecoin/unpause';
import { DollarSign } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
  isCurrentlyPaused: boolean;
}

export function Summary({ address, isCurrentlyPaused }: SummaryProps) {
  const { control } = useFormContext<Pause | UnPause>();

  return (
    <FormStep
      title="Review and confirm update proven collateral"
      description="Verify the details of your update proven collateral before proceeding."
    >
      <FormSummaryDetailCard
        title="Pause"
        description="Pausing operation details"
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Asset"
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label="Current state"
          value={isCurrentlyPaused ? 'Paused' : 'Active'}
        />
        <FormSummaryDetailItem
          label="Target state"
          value={isCurrentlyPaused ? 'Active' : 'Paused'}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
