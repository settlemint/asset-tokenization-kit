import { getStableCoins } from '@/app/(private)/admin/stablecoins/_components/data';
import { AssetFormDate } from '@/components/blocks/asset-form/inputs/asset-form-date';
import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { AssetFormSelect } from '@/components/blocks/asset-form/inputs/asset-form-select';
import {} from '@/components/ui/card';
import {} from '@/components/ui/form';
import {} from '@/components/ui/popover';
import { TokenType } from '@/types/token-types';
import {} from '@radix-ui/react-select';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { type CreateBondFormType, PaymentFrequency } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateBondFormType>();

  const { data: stableCoins } = useSuspenseQuery({
    queryKey: [TokenType.Stablecoin],
    queryFn: () => getStableCoins(),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your bond.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          <AssetFormSelect
            control={control}
            name="faceValueCurrency"
            label="Face value currency"
            options={stableCoins
              .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
              .map((coin) => ({
                label: `${coin.name ?? ''} (${coin.symbol ?? ''})`,
                value: coin.symbol ?? '',
              }))}
          />
          <AssetFormInput control={control} name="faceValue" label="Face value" type="number" />
          <AssetFormDate control={control} name="maturityDate" label="Maturity date" />
        </div>

        <h3 className="mt-8 font-semibold text-foreground text-sm">Yield configuration</h3>

        <div className="grid grid-cols-2 gap-6">
          <AssetFormInput control={control} name="couponRate" label="Coupon rate" type="number" postfix="%" />
          <AssetFormSelect
            control={control}
            name="paymentFrequency"
            label="Payment frequency"
            options={Object.entries(PaymentFrequency).map(([value, label]) => ({
              label,
              value,
            }))}
          />
          <AssetFormDate control={control} name="firstCouponDate" label="First payment date" />
        </div>
      </div>
    </div>
  );
}

Configuration.validatedFields = [
  'faceValueCurrency',
  'faceValue',
  'maturityDate',
  'couponRate',
  'paymentFrequency',
  'firstCouponDate',
] as const;
