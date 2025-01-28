import { AssetFormStep } from '@/components/blocks/asset-form/asset-form-step';

export function Configuration() {
  return (
    <AssetFormStep title="Configuration">
      <FormField name="name" />
      <FormField name="symbol" />
    </AssetFormStep>
  );
}
