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
import { Lock } from 'lucide-react';
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
          <AssetFormSummarySectionHeader icon={<Lock className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Contract Status</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>Current contract status and target state.</AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetProperty label="User" value={userAddress} type="address" />
            <AssetProperty label="Current State" value={blocked ? 'Blocked' : 'Active'} />
            <AssetProperty label="Target State" value={blocked ? 'Active' : 'Blocked'} />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
