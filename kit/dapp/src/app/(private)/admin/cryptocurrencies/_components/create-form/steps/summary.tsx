import { AssetFormStep } from '@/components/blocks/asset-form/asset-form-step';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <AssetFormStep title="Summary">
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Basics</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token name:</dt>
            <dd className="font-medium">{values.assetName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token symbol:</dt>
            <dd className="font-medium">{values.symbol}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Decimals:</dt>
            <dd className="font-medium">{values.decimals}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Private:</dt>
            <dd className="font-medium">{values.private ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Configuration</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Initial supply:</dt>
            <dd className="font-medium">{values.initialSupply}</dd>
          </div>
        </dl>
      </div>

      <div>
        <CardTitle>Pin Code</CardTitle>
        <CardDescription className="my-2">
          Please enter your pin code to confirm and sign the transaction.
        </CardDescription>

        <FormField
          control={control}
          name="pincode"
          render={({ field }) => (
            <FormItem className="!max-w-full mt-6">
              <FormLabel>Pin code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field} className="!w-full">
                  <InputOTPGroup className="rounded-md">
                    <InputOTPSlot index={0} className="flex-1" />
                    <InputOTPSlot index={1} className="flex-1" />
                    <InputOTPSlot index={2} className="flex-1" />
                    <InputOTPSlot index={3} className="flex-1" />
                    <InputOTPSlot index={4} className="flex-1" />
                    <InputOTPSlot index={5} className="flex-1" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </AssetFormStep>
  );
}
