'use client';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { format } from 'date-fns';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

interface SummaryProps {
  form: UseFormReturn<CreateTokenSchemaType>;
  tokenType: string;
}

export function Summary({ form, tokenType }: SummaryProps) {
  const values = useWatch({
    control: form.control,
  }) as CreateTokenSchemaType;

  return (
    <div className="space-y-8 ">
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
            <dd className="font-medium">{values.tokenName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token symbol:</dt>
            <dd className="font-medium">{values.tokenSymbol}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Decimals:</dt>
            <dd className="font-medium">{values.decimals}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">ISIN:</dt>
            <dd className="font-medium">{values.isin === '' ? '-' : values.isin}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Configuration</h3>
        <dl className="space-y-2">
          {tokenType === 'stablecoin' && values.tokenType === 'stablecoin' && (
            <>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Collateral Proof Validity Duration:</dt>
                <dd className="font-medium">{values.collateralProofValidityDuration} seconds</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Collateral Threshold:</dt>
                <dd className="font-medium">{values.collateralThreshold}%</dd>
              </div>
            </>
          )}
          {tokenType === 'equity' && values.tokenType === 'equity' && (
            <>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Equity Class:</dt>
                <dd className="font-medium">{values.equityClass}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Equity Category:</dt>
                <dd className="font-medium">{values.equityCategory}</dd>
              </div>
            </>
          )}
          {tokenType === 'bond' && values.tokenType === 'bond' && (
            <>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Face value currency:</dt>
                <dd className="font-medium">{values.faceValueCurrency}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Face value:</dt>
                <dd className="font-medium">{values.faceValue}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Maturity date:</dt>
                <dd className="font-medium">{format(values.maturityDate, 'PPP')}</dd>
              </div>
            </>
          )}
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
    </div>
  );
}
