import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormUsers } from '@/components/blocks/asset-form/inputs/asset-form-users';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ApproveFormType } from '../schema';

export function Recipients() {
  const { control } = useFormContext<ApproveFormType>();
  const [isManualEntry, setIsManualEntry] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Select Recipient</h2>
          <p className="text-muted-foreground text-sm">
            Search for a user by their name or email, or manually enter a wallet address.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {isManualEntry ? (
          <AssetFormInput
            control={control}
            name="to"
            label="Wallet Address"
            placeholder="0x0000000000000000000000000000000000000000"
          />
        ) : (
          <AssetFormUsers control={control} name="to" label="Wallet Address" placeholder="Search for a user" />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsManualEntry(!isManualEntry)}
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            {isManualEntry ? 'Search for a user instead...' : 'Enter address manually...'}
          </button>
        </div>
      </div>
    </div>
  );
}

Recipients.validatedFields = ['to'] as const;
