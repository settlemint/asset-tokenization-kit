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
import { PauseCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { PauseFormType } from '../schema';

export function Summary({ address, paused }: { address: Address; paused: boolean }) {
  const { control } = useFormContext<PauseFormType>();
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
            <AssetFormSummarySectionTitle>Contract Status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Current contract status and target state.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="Contract Address" value={address} type="address" />
            <AssetProperty label="Current State" value={paused ? 'Paused' : 'Active'} />
            <AssetProperty label="Target State" value={paused ? 'Active' : 'Paused'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
