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
  return (
    <div className="space-y-8">
      <div className="-mt-4">
        {/* Step 3 : Summary */}

        <CardTitle>Summary</CardTitle>
        <CardDescription className="my-2">Please review all the details you&apos;ve entered</CardDescription>
      </div>

      {/* Summary Section */}
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Basics</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token name:</dt>
            <dd className="font-medium">{form.getValues('tokenName')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token symbol:</dt>
            <dd className="font-medium">{form.getValues('tokenSymbol')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Decimals:</dt>
            <dd className="font-medium">{form.getValues('decimals')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">ISIN:</dt>
            <dd className="font-medium">{form.getValues('isin') === '' ? '-' : form.getValues('isin')}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Configuration</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral proof validity duration:</dt>
            <dd className="font-medium">{form.getValues('collateralProofValidityDuration')} seconds</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral threshold:</dt>
            <dd className="font-medium">{form.getValues('collateralThreshold')}%</dd>
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
