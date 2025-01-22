'use client';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

interface SummaryProps {
  form: UseFormReturn<CreateTokenSchemaType>;
}

export function Summary({ form }: SummaryProps) {
  const values = form.getValues();

  return (
    <div className="space-y-8">
      <div className="-mt-4">
        {/* Step 3 : Summary */}

        <CardTitle>Summary</CardTitle>
        <CardDescription className="my-2">Please review all the details you've entered</CardDescription>
      </div>

      {/* Summary Section */}
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Basics</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token Name:</dt>
            <dd className="font-medium">{values.tokenName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token Symbol:</dt>
            <dd className="font-medium">{values.tokenSymbol}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Decimals:</dt>
            <dd className="font-medium">{values.decimals}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">ISIN:</dt>
            <dd className="font-medium">{values.isin}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Configuration</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral Proof Validity Duration:</dt>
            <dd className="font-medium">{values.collateralProofValidityDuration} seconds</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral Threshold:</dt>
            <dd className="font-medium">{values.collateralThreshold}%</dd>
          </div>
        </dl>
      </div>

      {/* PIN Code Section */}
      <div>
        <CardTitle>Pin Code</CardTitle>
        <CardDescription className="my-2">
          Please enter your pin code to confirm and sign the transaction.
        </CardDescription>

        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>Pin code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
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
    </div>
  );
}
