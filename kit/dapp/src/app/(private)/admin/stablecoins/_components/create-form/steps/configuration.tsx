import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormSelect } from '@/components/blocks/asset-form/inputs/asset-form-select';
import {} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { CollateralProofValidityDuration, type CreateStablecoinFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your stable coin.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <AssetFormInput
          control={control}
          name="collateralThreshold"
          label="Collateral threshold"
          type="number"
          postfix="%"
          min={0}
          max={100}
          defaultValue={100}
        />
        <AssetFormSelect
          control={control}
          name="collateralProofValidityDuration"
          label="Collateral proof validity duration"
          defaultValue="OneYear"
          options={Object.entries(CollateralProofValidityDuration).map(([value, label]) => ({
            label,
            value,
          }))}
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['collateralThreshold', 'collateralProofValidityDuration'] as const;
