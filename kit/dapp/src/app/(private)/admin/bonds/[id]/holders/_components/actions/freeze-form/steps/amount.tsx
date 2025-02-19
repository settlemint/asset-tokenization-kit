import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { useFormContext } from 'react-hook-form';
import type { FreezeFormType } from '../schema';

export function Amount({ currentBalance, currentlyFrozen }: { currentBalance: number; currentlyFrozen: number }) {
  const { control } = useFormContext<FreezeFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Enter Amount</h2>
          <p className="text-muted-foreground text-sm">
            Input the amount you wish to freeze. This amount replaces any current frozen amount.
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
          max={currentBalance}
          description={`${currentBalance} available to freeze. ${currentlyFrozen} already frozen.`}
        />
      </div>
    </div>
  );
}

Amount.validatedFields = ['amount'] as const;
