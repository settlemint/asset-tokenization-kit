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
import { AssetSummaryItem } from '@/components/blocks/asset-form/asset-summary-item';
import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { PincodeConfirmation } from '@/components/blocks/asset-form/pincode-confirmation';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { MintFormType } from '../schema';

export function Summary({ address, decimals }: { address: Address; decimals: number }) {
  const { control } = useFormContext<MintFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm Mint</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your mint before proceeding. Ensure the recipient and amount are correct.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<DollarSign className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Asset details</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Details of the action you are about to perform.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Asset" value={address} type="address" />
            <AssetSummaryItem label="Recipient" value={values.to} type="address" />
            <AssetSummaryItem label="Amount" value={values.amount} type="number" />
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
