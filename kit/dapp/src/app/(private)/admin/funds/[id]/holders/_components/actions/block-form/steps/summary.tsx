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
import { Ban } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';
import type { BlockUserFormType } from '../schema';

export function Summary({ userAddress, blocked }: { userAddress: Address; blocked: boolean }) {
  const { control } = useFormContext<BlockUserFormType>();
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm {action}</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details before proceeding. This action will {blocked ? 'enable' : 'prevent'} token transfers.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<Ban className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Contract status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Current and target state of the user.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="User address" value={userAddress} type="address" />
            <AssetSummaryItem label="Current state" value={blocked ? 'Blocked' : 'Active'} />
            <AssetSummaryItem label="Target state" value={blocked ? 'Active' : 'Blocked'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
