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
import { formatAssetType } from '@/lib/utils/format-asset-type';
import { DollarSign } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { TransferFormAssetType, TransferFormType } from '../schema';

export function Summary({
  address,
  assetType,
  decimals,
}: { address: Address; assetType: TransferFormAssetType; decimals: number }) {
  const { control } = useFormContext<TransferFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm transfer</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your transfer before proceeding. Ensure the recipient and amount are correct.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<DollarSign className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Asset details</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Basic asset information and transfer details.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Asset type" value={formatAssetType(assetType)} />
            <AssetSummaryItem label="Asset" value={address} type="address" />
            <AssetSummaryItem label="Amount" value={values.value} type="number" />
            <AssetSummaryItem label="Recipient" value={values.to} type="address" />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        {/* Hidden form inputs */}
        <AssetFormInput control={control} name="address" type="hidden" defaultValue={address} />
        <AssetFormInput control={control} name="assetType" type="hidden" defaultValue={assetType} />
        <AssetFormInput control={control} name="decimals" type="hidden" defaultValue={decimals} />

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
