'use client';
import { TextInput } from '@/components/blocks/forms/controls/text-input';
import { FormMultiStep } from '@/components/blocks/forms/form-multistep';
import { FormStep } from '@/components/blocks/forms/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {} from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { toast } from 'sonner';
import { createTokenAction } from './create-pair-action';
import type { CreateDexPairSchemaType } from './create-pair-form-schema';
import { CreateDexPairSchema, createDexPairFormStepFields } from './create-pair-form-schema';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateDexPairSchemaType>;
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
  const { form, resetFormAndAction } = useHookFormAction(createTokenAction, zodResolver(CreateDexPairSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...createDexPairFormStepFields,
        ...defaultValues,
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
          <FormMultiStep<CreateDexPairSchemaType>
            config={{ useLocalStorageState: false }}
            formId="create-token-form"
            onSubmit={onSubmit}
            form={form}
          >
            <FormStep
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
            </FormStep>
            <FormStep
              form={form}
              title="Terms & Conditions"
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Continue' },
              }}
            >
              <p>By proceeding with the tokenization process, you agree to the following:</p>
              <ul>
                <li>Ensure that all asset details provided are accurate and comply with local laws and regulations.</li>
                <li>You are solely responsible for the legal implications of tokenizing assets.</li>
                <li>We do not offer legal or financial advice regarding tokenized assets.</li>
                <li>Your use of the platform is subject to our Privacy Policy and Terms of Service.</li>
              </ul>
              <p>Please review the full terms before continuing.</p>
              {/* TODO: do we want a formal check box here? */}
            </FormStep>
            <FormStep
              form={form}
              title="Token Information"
              fields={['baseTokenAddress', 'quoteTokenAddress']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                submit: { buttonText: 'Submit' },
              }}
            >
              {/* Base Token Address */}
              <TextInput
                control={form.control}
                label="Base Token Address"
                name="baseTokenAddress"
                description="This is the address of the base token"
                placeholder="Base Token Address"
              />

              {/* Quote Token Address */}
              <TextInput
                control={form.control}
                label="Quote Token Address"
                name="quoteTokenAddress"
                description="This is the address of the quote token"
                placeholder="Quote Token Address"
              />
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
