import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import {} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { CreateStablecoinFormType } from '../schema';

export function Recipients() {
  const { control } = useFormContext<CreateStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Select Recipient</h2>
          <p className="text-muted-foreground text-sm">
            Enter a wallet address to send tokens directly, or search for a user by their name or email.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput
          control={control}
          name="address"
          label="Wallet Address"
          placeholder="0x0000000000000000000000000000000000000000"
        />
      </div>
    </div>
  );
}

Recipients.validatedFields = ['address'] as const;
