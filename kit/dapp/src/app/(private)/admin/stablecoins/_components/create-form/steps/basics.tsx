import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormSwitch } from '@/components/blocks/asset-form/inputs/asset-form-switch';
import {} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { CreateStablecoinFormType } from '../schema';

export function Basics() {
  const { control } = useFormContext<CreateStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Basic Information</h2>
          <p className="text-muted-foreground text-sm">Configure the basic properties of your asset.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <AssetFormInput control={control} name="assetName" label="Name" placeholder="TotallyNotTether" />
        <AssetFormInput control={control} name="symbol" label="Symbol" placeholder="SAFU" />
        <AssetFormInput control={control} type="number" name="decimals" label="Decimals" defaultValue={18} />
        <AssetFormInput control={control} name="isin" label="ISIN" placeholder="DEFI4EVER2024" />
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

Basics.validatedFields = ['assetName', 'symbol', 'decimals', 'private', 'isin'] as const;
