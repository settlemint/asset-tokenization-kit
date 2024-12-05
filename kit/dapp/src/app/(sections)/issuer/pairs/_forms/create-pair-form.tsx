'use client';

import { Input } from '@/components/blocks/form/form-input';
import { FormMultiStepProvider } from '@/components/blocks/form/form-multistep';
import { FormPage } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { createTokenAction } from './create-pair-action';
import type { CreateDexPairSchemaType } from './create-pair-form-schema';
import { CreateDexPairSchema, createDexPairFormPageFields } from './create-pair-form-schema';

interface CreateTokenFormProps {
  defaultValues: Partial<CreateDexPairSchemaType>;
  formId: string;
  className?: string;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
      revertReasonDecoded
    }
  }
}`);

export function CreatePairForm({ defaultValues }: CreateTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<CreateDexPairSchemaType>>('state', defaultValues);

  const { form, resetFormAndAction } = useHookFormAction(createTokenAction, zodResolver(CreateDexPairSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...createDexPairFormPageFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: CreateDexPairSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await createTokenAction(values);

        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(CreateTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });

            return txresult.getTransaction?.receipt;
          },
        });
      },
      {
        loading: 'Creating token...',
        success: (data) => {
          return `New pair created in block ${data.blockNumber} on ${data.contractAddress}`;
        },
        error: (error) => {
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
    );
    // TODO: update the table
  }

  return (
    <div className="TokenizationWizard container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a new token</CardTitle>
          <CardDescription>Issue a new token.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider
            config={{ useLocalStorageState: false, useQueryState: false }}
            formId="create-token-form"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage
                  form={form}
                  title="Introduction"
                  controls={{
                    next: { buttonText: 'Continue' },
                  }}
                >
                  <div>
                    <p>Easily convert your assets into digital tokens using this step-by-step wizard.</p>
                    <p>Let&apos;s get started!</p>
                  </div>
                </FormPage>
                <FormPage
                  form={form}
                  title="Terms & Conditions"
                  controls={{
                    prev: { buttonText: 'Back' },
                    next: { buttonText: 'Continue' },
                  }}
                >
                  <p>By proceeding with the tokenization process, you agree to the following:</p>
                  <ul>
                    <li>
                      Ensure that all asset details provided are accurate and comply with local laws and regulations.
                    </li>
                    <li>You are solely responsible for the legal implications of tokenizing assets.</li>
                    <li>We do not offer legal or financial advice regarding tokenized assets.</li>
                    <li>Your use of the platform is subject to our Privacy Policy and Terms of Service.</li>
                  </ul>
                  <p>Please review the full terms before continuing.</p>
                  {/* TODO: do we want a formal check box here? */}
                </FormPage>
                <FormPage
                  form={form}
                  title="Token Information"
                  fields={['baseTokenAddress', 'quoteTokenAddress']}
                  withSheetClose
                  controls={{
                    prev: { buttonText: 'Back' },
                    submit: { buttonText: 'Submit' },
                  }}
                >
                  {/* Token Name */}
                  <FormField
                    control={form.control}
                    name="baseTokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Token Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Base Token Address" {...field} />
                        </FormControl>
                        <FormDescription>This is the address of the base token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Token Symbol */}
                  <FormField
                    control={form.control}
                    name="quoteTokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="Quote Token Address" {...field} />
                        </FormControl>
                        <FormDescription>This is the address of the quote token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormPage>
              </form>
            </Form>
          </FormMultiStepProvider>
        </CardContent>
      </Card>
    </div>
  );
}
