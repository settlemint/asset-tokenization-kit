import { AssetFormStep } from '@/components/blocks/asset-form/asset-form-step';

export function Summary() {
  return (
    <AssetFormStep title="Summary">
      <FormField name="name" />
      <FormField name="symbol" />
    </AssetFormStep>
  );
}
