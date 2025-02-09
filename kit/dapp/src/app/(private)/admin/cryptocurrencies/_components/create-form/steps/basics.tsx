import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormSwitch } from '@/components/blocks/asset-form/inputs/asset-form-switch';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Basics() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Basic Information</h2>
          <p className="text-muted-foreground text-sm">Configure the basic properties of your asset.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <AssetFormInput control={control} name="assetName" label="Name" placeholder="HODL Coin" />
        <AssetFormInput control={control} name="symbol" label="Symbol" placeholder="HODL" />
        <AssetFormInput control={control} type="number" name="decimals" label="Decimals" defaultValue={18} />
      </div>
      <AssetFormSwitch
        control={control}
        name="private"
        label="Private Token"
        helperText="Other organisations won&apos;t see this asset"
        defaultValue={true}
      />
    </div>
  );
}

Basics.validatedFields = ['assetName', 'symbol', 'decimals', 'private'] as const;
