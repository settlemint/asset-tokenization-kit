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
            <AssetProperty label="Asset name" value={values.assetName} />
            <AssetProperty label="Symbol" value={values.symbol} />
            <AssetProperty label="Decimals" value={values.decimals} type="number" />
            <AssetProperty label="ISIN" value={values.isin} />
            <AssetProperty label="Privacy" value={values.private ? 'Private' : 'Public'} />
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
            <AssetProperty label="Collateral proof validity" value={values.collateralProofValidityDuration} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
