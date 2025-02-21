import type { CollateralProofValidityDuration } from '@/app/(private)/admin/stablecoins/_components/create-form/schema';
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
import { PincodeConfirmation } from '@/components/blocks/asset-form/pincode-confirmation';
import { DollarSign, Settings } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CreateStablecoinFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateStablecoinFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm creation</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your stablecoin before proceeding. Ensure all information is correct.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<DollarSign className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Asset basics</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Basic information about your stablecoin.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Asset name" value={values.assetName} />
            <AssetSummaryItem label="Symbol" value={values.symbol} />
            <AssetSummaryItem
              label="Decimals"
              value={values.decimals}
              type="number"
              options={{ number: { decimals: 0 } }}
            />
            <AssetSummaryItem label="ISIN" value={values.isin} />
            <AssetSummaryItem label="Privacy" value={values.private ? 'Private' : 'Public'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<Settings className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Configuration</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Additional configuration for your stablecoin.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem
              label="Collateral proof validity"
              value={formatCollateralProofValidityDuration(values.collateralProofValidityDuration)}
            />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

function formatCollateralProofValidityDuration(duration?: keyof typeof CollateralProofValidityDuration) {
  if (!duration) {
    return '-';
  }

  switch (duration) {
    case 'OneHour':
      return '1 hour';
    case 'OneDay':
      return '1 day';
    case 'OneWeek':
      return '1 week';
    case 'OneMonth':
      return '1 month';
    case 'OneYear':
      return '1 year';
    default: {
      const exhaustiveCheck: never = duration;
      throw new Error(`Unknown collateral proof validity duration: ${exhaustiveCheck}`);
    }
  }
}

Summary.validatedFields = ['pincode'] as const;
