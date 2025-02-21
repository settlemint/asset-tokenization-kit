import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { formatNumber } from '@/lib/number';
import { useFormContext } from 'react-hook-form';
import type { ApproveFormType } from '../schema';

export function Amount({ amountLimit }: { amountLimit: bigint }) {
  const { control } = useFormContext<ApproveFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Enter Amount</h2>
          <p className="text-muted-foreground text-sm">
            Enter the amount you wish to approve for spending. This defines the maximum limit that the selected spender
            can use.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput
          control={control}
          name="amount"
          label="Amount"
          type="number"
          min={1}
          defaultValue={1}
          max={amountLimit?.toString()}
          description={`Available balance: ${formatNumber(amountLimit)}`}
        />
      </div>
    </div>
  );
}

Amount.validatedFields = ['amount'] as const;
