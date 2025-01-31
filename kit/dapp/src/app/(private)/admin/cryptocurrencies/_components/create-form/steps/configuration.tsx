import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import {} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Configure the supply and distribution of your asset.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput control={control} name="initialSupply" label="Initial supply" defaultValue={0} />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['initialSupply'] as const;
