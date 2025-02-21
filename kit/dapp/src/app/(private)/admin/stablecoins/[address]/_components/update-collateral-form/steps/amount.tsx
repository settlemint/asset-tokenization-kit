import { AssetFormStep } from '@/components/blocks/asset-form/step/step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { UpdateCollateral } from '@/lib/mutations/stablecoin/update-collateral';
import { useFormContext } from 'react-hook-form';

export function Amount() {
  const { control } = useFormContext<UpdateCollateral>();

  return (
    <AssetFormStep
      title="Enter Amount"
      description="Input the amount you wish to update the collateral to. Ensure the amount is bigger or equal to the current supply."
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput control={control} name="amount" label="Amount" type="number" min={1} />
      </div>
    </AssetFormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
