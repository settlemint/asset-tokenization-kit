import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import { FormSwitch } from '@/components/blocks/form/inputs/form-switch';
import type { CreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { useFormContext } from 'react-hook-form';

export function Basics() {
  const { control } = useFormContext<CreateStablecoin>();

  return (
    <FormStep
      title="Basic Information"
      description="Configure the basic properties of your asset."
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="assetName"
          label="Name"
          placeholder="TotallyNotTether"
        />
        <FormInput
          control={control}
          name="symbol"
          label="Symbol"
          placeholder="SAFU"
          textOnly
        />
        <FormInput
          control={control}
          type="number"
          name="decimals"
          label="Decimals"
          defaultValue={18}
        />
        <FormInput
          control={control}
          name="isin"
          label="ISIN"
          placeholder="DEFI4EVER2024"
        />
      </div>
      <FormSwitch
        control={control}
        name="privateAsset"
        label="Private Token"
        description="Other organisations won't see this asset"
        defaultValue={true}
      />
    </FormStep>
  );
}

Basics.validatedFields = [
  'assetName',
  'symbol',
  'decimals',
  'privateAsset',
  'isin',
] as const;
