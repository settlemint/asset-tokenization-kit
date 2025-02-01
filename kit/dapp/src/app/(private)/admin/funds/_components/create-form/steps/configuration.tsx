import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { useFormContext } from 'react-hook-form';
import type { CreateFundFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateFundFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your equity.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <AssetFormInput control={control} name="fundClass" label="Fund class" placeholder="Long/Short Equity" />
        <AssetFormInput control={control} name="fundCategory" label="Fund category" placeholder="Global Macro" />
        <AssetFormInput
          control={control}
          name="managementFeeBps"
          label="Management fee"
          defaultValue={2}
          type="number"
          postfix="%"
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['fundClass', 'fundCategory', 'managementFeeBps'] as const;
