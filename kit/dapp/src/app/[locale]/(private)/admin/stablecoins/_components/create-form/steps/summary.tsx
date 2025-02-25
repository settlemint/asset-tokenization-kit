import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { CreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { DollarSign, Settings } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

export function Summary() {
  const { control } = useFormContext<CreateStablecoin>();
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep
      title="Review and confirm update proven collateral"
      description="Verify the details of your update proven collateral before proceeding."
    >
      <FormSummaryDetailCard
        title="Asset Basics"
        description="Basic asset information and settings."
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem label="Name" value={values.assetName} />
        <FormSummaryDetailItem label="Symbol" value={values.symbol} />
        <FormSummaryDetailItem label="Decimals" value={values.decimals} />
        <FormSummaryDetailItem
          label="ISIN"
          value={values.isin === '' ? '-' : values.isin}
        />
        <FormSummaryDetailItem
          label="Private"
          value={values.privateAsset ? 'Yes' : 'No'}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title="Configuration"
        description="Asset supply and additional settings."
        icon={<Settings className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Collateral Proof Validity"
          value={`${values.collateralLivenessSeconds} seconds`}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
