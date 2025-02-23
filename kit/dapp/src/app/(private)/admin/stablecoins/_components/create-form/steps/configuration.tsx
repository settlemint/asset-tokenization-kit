import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoin>();

  return (
    <FormStep
      title="Configuration"
      description="Set parameters specific to your stable coin."
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label="Collateral Proof Validity"
          postfix="seconds"
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['collateralLivenessSeconds'] as const;
