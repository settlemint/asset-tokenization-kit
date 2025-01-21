import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { CardDescription, CardTitle } from '@/components/ui/card';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

export const TokenConfiguration = ({ form }: { form: UseFormReturn<CreateTokenSchemaType> }) => {
  return (
    <div className="-mt-4">
      <CardTitle>Stable coin configuration</CardTitle>
      <CardDescription className="my-2">Set parameters specific to your stable coin.</CardDescription>

      {/* Collateral threshold */}
      <NumericInput
        control={form.control}
        label="Collateral threshold"
        name="collateralThreshold"
        placeholder="e.g., 100"
        showRequired
      />

      {/* Collateral Proof Validity duration */}
      <NumericInput
        control={form.control}
        label="Collateral Proof Validity duration"
        name="collateralProofValidityDuration"
        placeholder="e.g., 3600"
        showRequired
      />
    </div>
  );
};
