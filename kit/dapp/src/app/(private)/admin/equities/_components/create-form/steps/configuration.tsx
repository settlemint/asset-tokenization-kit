import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import {} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { CreateEquityFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateEquityFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your equity.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput control={control} name="equityClass" label="Equity class" placeholder="Common Stock" />
        <AssetFormInput
          control={control}
          name="equityCategory"
          label="Equity category"
          placeholder="Oil & Gas Drilling"
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['equityClass', 'equityCategory'] as const;
