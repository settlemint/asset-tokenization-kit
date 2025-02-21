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
import type { Role } from '@/lib/config/roles';
import { getRoleDisplayName } from '@/lib/config/roles';
import { UserPlus } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';
import type { AddTokenAdminFormType } from '../schema';

export function Summary({ address }: { address: Address }) {
  const { control } = useFormContext<AddTokenAdminFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormSummary>
      <div>
        <AssetFormSummaryTitle>Review and confirm new admin roles</AssetFormSummaryTitle>
        <AssetFormSummarySubTitle>
          Verify the details before proceeding. This action will grant admin roles to the specified address.
        </AssetFormSummarySubTitle>
      </div>

      <div className="space-y-4">
        <AssetFormSummarySection>
          <AssetFormSummarySectionHeader icon={<UserPlus className="h-3 w-3 text-primary" />}>
            <AssetFormSummarySectionTitle>Admin details</AssetFormSummarySectionTitle>
            <AssetFormSummarySectionSubTitle>
              Review the new admin address and roles to be granted.
            </AssetFormSummarySectionSubTitle>
          </AssetFormSummarySectionHeader>

          <AssetFormSummaryContent>
            <AssetSummaryItem label="Token address" value={address} type="address" />
            <AssetSummaryItem label="New admin address" value={values.userAddress as Address} type="address" />
            <AssetSummaryItem
              label="Roles to grant"
              value={Object.entries(values.roles ?? {})
                .filter(([_, isEnabled]) => isEnabled)
                .map(([role]) => (
                  <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
                    {getRoleDisplayName(role as Role)}
                  </span>
                ))
                .join(', ')}
            />
          </AssetFormSummaryContent>
        </AssetFormSummarySection>

        <PincodeConfirmation control={control} />
      </div>
    </AssetFormSummary>
  );
}

Summary.validatedFields = ['pincode'] as const;
