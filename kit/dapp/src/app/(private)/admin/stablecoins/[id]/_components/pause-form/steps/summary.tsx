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
import { PauseCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';

export function Summary({ address, paused }: { address: Address; paused: boolean }) {
  const { control } = useFormContext();
  const action = paused ? 'Unpause' : 'Pause';
  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm {action}</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details before proceeding. This action will {paused ? 'enable' : 'prevent'} token transfers.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<PauseCircle className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Contract status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Current and target state of the contract.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Contract address" value={address} type="address" />
            <AssetSummaryItem label="Current state" value={paused ? 'Paused' : 'Active'} />
            <AssetSummaryItem label="Target state" value={paused ? 'Active' : 'Paused'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
