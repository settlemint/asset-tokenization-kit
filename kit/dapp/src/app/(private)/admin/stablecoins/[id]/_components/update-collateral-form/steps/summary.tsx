import {
  AssetFormSummary,
  AssetFormSummaryContent,
  AssetFormSummarySection,
  AssetFormSummarySectionHeader,
  AssetFormSummarySectionSubTitle,
  AssetFormSummarySectionTitle,
  AssetFormSummarySubTitle,
  AssetFormSummaryTitle,
} from '@/components/blocks/asset-form/asset-form-summary';
import { AssetProperty } from '@/components/blocks/asset-form/asset-property';
import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { PincodeConfirmation } from '@/components/blocks/asset-form/pincode-confirmation';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { UpdateCollateralFormType } from '../schema';

export function Summary({ address, decimals }: { address: Address; decimals: number }) {
  const { control } = useFormContext<UpdateCollateralFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm update proven collateral</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your update proven collateral before proceeding.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<DollarSign className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Action details</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Details of the action you are about to perform.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="Asset" value={address} type="address" />
            <AssetProperty label="Amount" value={values.amount} type="number" />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        {/* Hidden form inputs */}
        <AssetFormInput control={control} name="address" type="hidden" defaultValue={address} />
        <AssetFormInput control={control} name="decimals" type="hidden" defaultValue={decimals} />

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
