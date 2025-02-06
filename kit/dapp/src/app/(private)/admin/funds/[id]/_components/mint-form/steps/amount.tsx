import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { useFormContext } from 'react-hook-form';
import type { MintStablecoinFormType } from '../schema';

export function Amount() {
  const { control } = useFormContext<MintStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Enter Amount</h2>
          <p className="text-muted-foreground text-sm">
            Input the amount you wish to mint. Ensure the amount stays within the collateral limits.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput control={control} name="amount" label="Amount" type="number" min={1} defaultValue={1} />
      </div>
    </div>
  );
}

Amount.validatedFields = ['amount'] as const;
