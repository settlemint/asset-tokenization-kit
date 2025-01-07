'use client';
import { FileInput } from '@/components/blocks/form/controls/file-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {} from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { SunIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createTokenAction } from './create-token-action';
import type { CreateTokenSchemaType } from './create-token-form-schema';
import { CreateTokenSchema, createTokenDefaultValues } from './create-token-form-schema';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateTokenSchemaType>;
  formId: string;
  className?: string;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  StarterKitERC20FactoryCreateTokenReceipt(transactionHash: $transactionHash) {
    contractAddress
    status
    blockNumber
    revertReasonDecoded
  }
}`);

export function CreateTokenForm({ defaultValues }: CreateTokenFormProps) {
  const { form, resetFormAndAction } = useHookFormAction(createTokenAction, zodResolver(CreateTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...createTokenDefaultValues,
        ...defaultValues,
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: CreateTokenSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await createTokenAction(values);
        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(CreateTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });

            return txresult.StarterKitERC20FactoryCreateTokenReceipt;
          },
        });
      },
      {
        loading: 'Creating token...',
        success: (data) => {
          return `${values.tokenName} (${values.tokenSymbol}) created in block ${data.blockNumber} on ${data.contractAddress}`;
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
          <FormMultiStep<CreateTokenSchemaType>
            form={form}
            config={{ useLocalStorageState: false }}
            formId="create-token-form"
            onSubmit={onSubmit}
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
              fields={['tokenName', 'tokenSymbol']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                submit: { buttonText: 'Submit' },
              }}
            >
              {/* Token Name */}
              <TextInput
                control={form.control}
                label="Token Name"
                name="tokenName"
                description="This is the name of the token"
                placeholder="Token Name"
              />
              {/* Token Symbol */}
              <TextInput
                control={form.control}
                label="Token Symbol"
                name="tokenSymbol"
                description="This is the symbol of the token"
                placeholder="Token Symbol"
                variant="icon"
                icon={<SunIcon />}
              />

              {/* Token Logo */}
              <FileInput
                control={form.control}
                name="tokenLogo"
                description="This is the logo of the token"
                label="Token Logo"
                text="Click, or drop your logo here"
                multiple={false}
                maxSize={1024 * 1024 * 10} // 10MB
                accept={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                  'text/*': [],
                }}
                server={{
                  bucket: 'default-bucket',
                  storage: 'minio',
                }}
              />
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
