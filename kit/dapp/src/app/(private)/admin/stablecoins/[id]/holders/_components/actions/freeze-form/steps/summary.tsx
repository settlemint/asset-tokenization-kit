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
import { Snowflake } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

export function Summary({
  userAddress,
  currentBalance,
  currentlyFrozen,
}: {
  userAddress: Address;
  currentBalance: bigint;
  currentlyFrozen: bigint;
}) {
  const { control } = useFormContext();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm freeze</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your freeze action before proceeding. This will affect the specified amount of user's
          tokens.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<Snowflake className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Contract status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Current and target state of the user's tokens.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="User address" value={userAddress} type="address" />
            <AssetSummaryItem label="Current balance" value={currentBalance.toString()} />
            <AssetSummaryItem label="Currently frozen" value={currentlyFrozen.toString()} />
            <AssetSummaryItem label="Amount to freeze" value={values.amount} type="number" />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
