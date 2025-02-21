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
import type { CreateBondFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateBondFormType>();
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
            <AssetSummaryItem label="Name" value={values.assetName} />
            <AssetSummaryItem label="Symbol" value={values.symbol} />
            <AssetSummaryItem label="Decimals" value={values.decimals} options={{ number: { decimals: 0 } }} />
            <AssetSummaryItem label="ISIN" value={values.isin} />
            <AssetSummaryItem label="Cap" value={values.cap} options={{ number: { token: values.symbol } }} />
            <AssetSummaryItem label="Private" value={values.private} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<Settings className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Configuration</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Asset supply and additional settings.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Face value currency" value={values.faceValueCurrency} />
            <AssetSummaryItem label="Face value" value={values.faceValue} />
            <AssetSummaryItem label="Maturity date" value={values.maturityDate} />
            <AssetSummaryItem
              label="Coupon rate"
              value={values.couponRate}
              options={{ number: { percentage: true } }}
            />
            <AssetSummaryItem label="Payment frequency" value={values.paymentFrequency} />
            <AssetSummaryItem label="First payment date" value={values.firstCouponDate} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
