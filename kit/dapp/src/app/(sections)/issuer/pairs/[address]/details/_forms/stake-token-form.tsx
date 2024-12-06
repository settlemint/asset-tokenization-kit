'use client';

import { NumericInput } from '@/components/blocks/form/form-input-numeric';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { approveTokenAction } from './approve-token-action';
import { stakeTokenAction } from './stake-token-action';
import { StakeTokenSchema, type StakeTokenSchemaType, stakeTokenFormStepFields } from './stake-token-form-schema';

interface StakeTokenFormProps {
  defaultValues: Partial<StakeTokenSchemaType>;
  formId: string;
  className?: string;
}

const StakeTokenReceiptQuery = portalGraphql(`
query StakeTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
      revertReasonDecoded
    }
  }
}`);

// TODO: we need to provide deep insights in how the action will impact the pool

export function StakeTokenForm({ defaultValues, formId }: StakeTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<StakeTokenSchemaType>>('state', defaultValues);

  // TODO: i added a ton of logging here because i could not capture errors on validation (the schema required a field i did not send) and i still can't, we need to fogure out how to have full visibility
  const { form, resetFormAndAction } = useHookFormAction(stakeTokenAction, zodResolver(StakeTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...stakeTokenFormStepFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  // Debug validation
  useEffect(() => {
    const subscription = form.watch(() => {});

    return () => subscription.unsubscribe();
  }, [form]);

  // TODO: i would like to see three toasts, one for each action
  // TODO: The action flow for portal mutations is always the same, so we should abstract it away while keeping full types
  function onSubmit(values: StakeTokenSchemaType) {
    toast.promise(
      async () => {
        await Promise.all([
          approveTokenAction({
            tokenAddress: values.baseTokenAddress,
            spender: values.tokenAddress,
            approveAmount: values.baseAmount,
          }),
          approveTokenAction({
            tokenAddress: values.quoteTokenAddress,
            spender: values.tokenAddress,
            approveAmount: values.quoteAmount,
          }),
        ]);
        const transactionHash = await stakeTokenAction(values);

        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(StakeTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });

            return txresult.getTransaction?.receipt;
          },
        });
      },
      {
        loading: 'Staking tokens...',
        success: (data) => {
          return `${values.baseAmount}/${values.quoteAmount} tokens stakes in block ${data.blockNumber}`;
        },
        error: (error) => {
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
    );
  }

  return (
    <div className="StakeTokenForm container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stake tokens</CardTitle>
          <CardDescription>Distribute your digital tokens to token holder</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStep<StakeTokenSchemaType>
            config={{ useLocalStorageState: false }}
            form={form}
            formId={formId}
            onSubmit={onSubmit}
          >
            <FormStep
              form={form}
              title="Stake tokens"
              fields={['baseAmount', 'quoteAmount']} // This should be typed
              withSheetClose
              controls={{
                submit: { buttonText: 'Submit' },
              }}
            >
              {/* Base amount, should be enhanced with the actual token info */}
              <FormField
                control={form.control}
                name="baseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Amount</FormLabel>
                    <FormControl>
                      <NumericInput placeholder="Base Amount" {...field} />
                    </FormControl>
                    <FormDescription>This is the amount of base tokens you want to stake</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quoteAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Amount</FormLabel>
                    <FormControl>
                      <NumericInput placeholder="Quote Amount" {...field} />
                    </FormControl>
                    <FormDescription>This is the amount of quote tokens you want to stake</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
