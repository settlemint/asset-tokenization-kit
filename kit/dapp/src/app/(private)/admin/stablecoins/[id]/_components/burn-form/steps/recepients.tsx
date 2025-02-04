import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { useFormContext } from 'react-hook-form';
import type { BurnStablecoinFormType } from '../schema';

export function Recipients() {
  const { control } = useFormContext<BurnStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Select Recipient</h2>
          <p className="text-muted-foreground text-sm">
            Enter a wallet address from which the tokens will be burned, you can search for a user by their name, email
            or address.
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
