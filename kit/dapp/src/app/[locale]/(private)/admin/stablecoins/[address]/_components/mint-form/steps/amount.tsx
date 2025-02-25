import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { Mint } from '@/lib/mutations/stablecoin/mint';
import { formatNumber } from '@/lib/utils/number';
import { useFormContext } from 'react-hook-form';

interface AmountProps {
  collateralAvailable: number;
}

export function Amount({ collateralAvailable }: AmountProps) {
  const { control } = useFormContext<Mint>();

  return (
    <FormStep
      title="Enter Amount"
      description="Input the amount you wish to mint."
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label="Amount"
          type="number"
          min={1}
          max={collateralAvailable}
          description={`Collateral available: ${formatNumber(collateralAvailable)}`}
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
