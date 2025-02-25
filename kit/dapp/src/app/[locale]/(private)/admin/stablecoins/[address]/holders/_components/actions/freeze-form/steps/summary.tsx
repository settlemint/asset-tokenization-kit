import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { Burn } from '@/lib/mutations/stablecoin/burn';
import { formatNumber } from '@/lib/utils/number';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<Burn>();
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep
      title="Review and confirm freeze"
      description="Verify the details of your freeze before proceeding."
    >
      <FormSummaryDetailCard
        title="Freeze"
        description="Freezing operation details"
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Asset"
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label="Amount"
          value={formatNumber(values.amount)}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
