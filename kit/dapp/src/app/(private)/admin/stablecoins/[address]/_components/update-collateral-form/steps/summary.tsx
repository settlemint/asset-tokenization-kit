import { AssetFormStep } from '@/components/blocks/asset-form/step/step';
import { AssetFormSummaryDetailCard } from '@/components/blocks/asset-form/step/summary/card';
import { AssetFormSummaryDetailItem } from '@/components/blocks/asset-form/step/summary/item';
import { AssetFormSummarySecurityConfirmation } from '@/components/blocks/asset-form/step/summary/security-confirmation';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import type { UpdateCollateral } from '@/lib/mutations/stablecoin/update-collateral';
import { formatNumber } from '@/lib/number';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<UpdateCollateral>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormStep
      title="Review and confirm update proven collateral"
      description="Verify the details of your update proven collateral before proceeding."
    >
      <AssetFormSummaryDetailCard icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}>
        <AssetFormSummaryDetailItem label="Asset" value={<EvmAddress address={address} />} />
        <AssetFormSummaryDetailItem label="Amount" value={formatNumber(values.amount ?? 0)} />
      </AssetFormSummaryDetailCard>

      <AssetFormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </AssetFormSummarySecurityConfirmation>
    </AssetFormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
