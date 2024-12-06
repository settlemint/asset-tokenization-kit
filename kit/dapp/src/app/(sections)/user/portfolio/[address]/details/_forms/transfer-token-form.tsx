'use client';

import { Input } from '@/components/blocks/form/form-input';
import { NumericInput } from '@/components/blocks/form/form-input-numeric';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { transferTokenAction } from './transfer-token-action';
import {
  TransferTokenSchema,
  type TransferTokenSchemaType,
  transferTokenFormStepFields,
} from './transfer-token-form-schema';

interface TransferTokenFormProps {
  defaultValues: Partial<TransferTokenSchemaType>;
  formId: string;
  className?: string;
}

const TransferTokenReceiptQuery = portalGraphql(`
query TransferTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
      revertReasonDecoded
    }
  }
}`);

export function TransferTokenForm({ defaultValues }: TransferTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<TransferTokenSchemaType>>('state', defaultValues);
  const queryClient = useQueryClient();

  const { form, resetFormAndAction } = useHookFormAction(transferTokenAction, zodResolver(TransferTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...transferTokenFormStepFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: TransferTokenSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await transferTokenAction(values);
        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(TransferTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });

            return txresult.getTransaction?.receipt;
          },
        });
      },
      {
        loading: 'Transferring token...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: ['token-volumes'] });
          return `${values.amount} tokens transferred to (${values.to}) in block ${data.blockNumber}`;
        },
        error: (error) => {
          queryClient.invalidateQueries({ queryKey: ['token-volumes'] });
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
    );
  }

  return (
    <div className="MinTokenForm container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transfer tokens</CardTitle>
          <CardDescription>Transfer your tokens to another wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStep<TransferTokenSchemaType>
            form={form}
            config={{ useLocalStorageState: false }}
            formId="transfer-token-form"
            onSubmit={onSubmit}
          >
            <FormStep
              form={form}
              title="Transfer tokens"
              fields={['amount', 'to']}
              withSheetClose
              controls={{
                submit: { buttonText: 'Submit' },
              }}
            >
              {/* Transfer amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <NumericInput placeholder="Amount" {...field} />
                    </FormControl>
                    <FormDescription>This is the amount of tokens you want to transfer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Transfer to wallet */}
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet address</FormLabel>
                    <FormControl>
                      <Input placeholder="To address" {...field} />
                    </FormControl>
                    <FormDescription>This is the wallet address of the token holder</FormDescription>
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
