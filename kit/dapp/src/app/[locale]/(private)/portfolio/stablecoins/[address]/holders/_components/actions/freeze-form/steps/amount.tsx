import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { Burn } from '@/lib/mutations/stablecoin/burn';
import { formatNumber } from '@/lib/utils/number';
import { useFormContext } from 'react-hook-form';

interface AmountProps {
  balance: number;
  frozen: number;
  symbol: string;
}

export function Amount({ balance, frozen, symbol }: AmountProps) {
  const { control } = useFormContext<Burn>();

  return (
    <FormStep
      title="Enter Amount"
      description="Input the amount you wish to freeze."
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label="Amount"
          type="number"
          min={1}
          max={balance}
          description={`Available balance: ${formatNumber(balance, {
            token: symbol,
          })} Current frozen: ${formatNumber(frozen, {
            token: symbol,
          })}`}
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
