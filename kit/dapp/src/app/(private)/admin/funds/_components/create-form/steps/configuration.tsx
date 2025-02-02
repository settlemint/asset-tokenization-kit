import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormSelect } from '@/components/blocks/asset-form/inputs/asset-form-select';
import { useFormContext } from 'react-hook-form';
import { fundCategories, fundClasses } from '../options';
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
        <AssetFormSelect
          control={control}
          name="fundCategory"
          label="Fund category"
          options={fundCategories.map((category) => ({ label: category, value: category }))}
        />
        <AssetFormSelect
          control={control}
          name="fundClass"
          label="Fund class"
          options={fundClasses.map((category) => ({ label: category, value: category }))}
        />
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
