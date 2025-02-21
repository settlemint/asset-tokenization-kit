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

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm pause</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details of your pause action before proceeding. This will affect all transfers of the asset.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<PauseCircle className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Contract status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Current and target state of the contract.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="Contract address" value={address} type="address" />
            <AssetProperty label="Current state" value={paused ? 'Paused' : 'Active'} />
            <AssetProperty label="Target state" value={paused ? 'Active' : 'Paused'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
