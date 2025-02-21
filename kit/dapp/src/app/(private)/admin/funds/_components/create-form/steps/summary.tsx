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
import type { CreateFundFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateFundFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Summary</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>Review your asset configuration before deployment.</AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<DollarSign className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Asset Basics</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Basic asset information and settings.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="Name" value={values.assetName} />
            <AssetProperty label="Symbol" value={values.symbol} />
            <AssetProperty label="Decimals" value={values.decimals} options={{ number: { decimals: 0 } }} />
            <AssetProperty label="ISIN" value={values.isin} />
            <AssetProperty label="Private" value={values.private} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<Settings className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Configuration</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Asset supply and additional settings.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="Fund class" value={values.fundClass} />
            <AssetProperty label="Fund category" value={values.fundCategory} />
            <AssetProperty
              label="Management fee"
              value={values.managementFeeBps}
              options={{ number: { percentage: true } }}
            />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
