import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { SelectItem } from '@/components/ui/select';
import type { UseFormReturn } from 'react-hook-form';
import { type CreateTokenSchemaType, PaymentFrequency } from '../create-token-form-schema';

export const TokenConfiguration = ({
  form,
  tokenType,
}: { form: UseFormReturn<CreateTokenSchemaType>; tokenType: string }) => {
  return (
    <>
      {tokenType === 'stablecoin' && (
        <div className="-mt-4">
          <CardTitle>Stable coin configuration</CardTitle>
          <CardDescription className="my-2">Set parameters specific to your stable coin.</CardDescription>

          {/* Collateral threshold */}
          <NumericInput
            control={form.control}
            label="Collateral threshold"
            name="collateralThreshold"
            placeholder="e.g., 100"
            addonRight="%"
            showRequired
          />

          {/* Collateral Proof Validity duration */}
          <NumericInput
            control={form.control}
            label="Collateral Proof Validity duration"
            name="collateralProofValidityDuration"
            placeholder="e.g., 3600"
            addonRight="seconds"
            showRequired
          />
        </div>
      )}
      {tokenType === 'equity' && (
        <div className="-mt-4">
          <CardTitle>Equity configuration</CardTitle>
          <CardDescription className="my-2">Set parameters specific to your equity.</CardDescription>

          {/* Equity class */}
          <TextInput
            control={form.control}
            label="Equity class"
            name="equityClass"
            placeholder="e.g., Common"
            showRequired
          />

          {/* Equity category */}
          <TextInput
            control={form.control}
            label="Equity category"
            name="equityCategory"
            placeholder="e.g., Series A"
            showRequired
          />
        </div>
      )}
      {tokenType === 'bond' && (
        <div className="-mt-4">
          <CardTitle>Bond configuration</CardTitle>
          <CardDescription className="my-2">Set parameters specific to your bond.</CardDescription>

          {/* Face value currency */}
          <TextInput
            control={form.control}
            label="Face value currency"
            name="faceValueCurrency"
            placeholder="e.g., Common"
            showRequired
          />

          {/* Face value */}
          <NumericInput
            control={form.control}
            label="Face value"
            name="faceValue"
            placeholder="e.g., 1000"
            showRequired
          />

          {/* Maturity date */}
          <TextInput
            control={form.control}
            label="Maturity date"
            name="maturityDate"
            placeholder="e.g., Series A"
            showRequired
          />

          <CardTitle className="mt-8">Yield configuration</CardTitle>
          <CardDescription className="my-2">Set parameters specific to the yield of your bond.</CardDescription>

          {/* Coupon rate */}
          <NumericInput
            control={form.control}
            label="Coupon rate"
            name="couponRate"
            placeholder="e.g., 1000"
            showRequired
          />

          {/* Payment frequency */}
          <SelectInput
            control={form.control}
            label="Payment frequency"
            name="paymentFrequency"
            placeholder="Select payment frequency"
            showRequired
          >
            {Object.entries(PaymentFrequency).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectInput>

          {/* First coupon date */}
          <TextInput
            control={form.control}
            label="First payment date"
            name="firstCouponDate"
            placeholder=""
            showRequired
          />
        </div>
      )}
    </>
  );
};
