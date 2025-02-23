import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { GrantRole } from '@/lib/mutations/stablecoin/grant-role';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function AdminAddress() {
  const { control } = useFormContext<GrantRole>();
  const [isManualEntry, setIsManualEntry] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">
            Select New Admin
          </h2>
          <p className="text-muted-foreground text-sm">
            Search for a user by their name or email, or manually enter a wallet
            address.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {isManualEntry ? (
          <FormInput
            control={control}
            name="userAddress"
            label="Admin Wallet Address"
            placeholder="0x0000000000000000000000000000000000000000"
          />
        ) : (
          <FormInput
            control={control}
            name="userAddress"
            label="Admin Wallet Address"
            placeholder="Search for a user"
          />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsManualEntry(!isManualEntry)}
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            {isManualEntry
              ? 'Search for a user instead...'
              : 'Enter address manually...'}
          </button>
        </div>
      </div>
    </div>
  );
}

AdminAddress.validatedFields = ['userAddress'] as const;
