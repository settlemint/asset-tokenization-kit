'use client';
import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { TokenPermissionsInput } from '@/components/blocks/form/controls/token-permissions-input';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormStepProgress } from '@/components/blocks/form/form-step-progress';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {} from '@/components/ui/form';
import type { User } from '@/lib/auth/types';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type TransactionReceiptWithDecodedError, waitForTransactionReceipt } from '@/lib/transactions';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import type { Address } from 'viem';
import { createTokenAction } from './create-token-action';
import type { CreateTokenSchemaType } from './create-token-form-schema';
import { CreateTokenSchema, createTokenDefaultValues } from './create-token-form-schema';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateTokenSchemaType>;
  formId: string;
  className?: string;
  users: User[];
}

type AvatarUser = {
  wallet: Address;
  email?: string;
  name?: string;
};

interface TokenReceiptResponse {
  StarterKitERC20FactoryCreateTokenReceipt: TransactionReceiptWithDecodedError | null | undefined;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  StableCoinFactoryCreateReceipt(transactionHash: $transactionHash) {
    contractAddress
    status
    blockNumber
    revertReasonDecoded
  }
}`);

export function CreateTokenForm({ defaultValues, users }: CreateTokenFormProps) {
  const _users = [
    {
      name: 'Roderik van der Veer',
      email: 'roderik@settlemint.com',
      wallet: '0xC63572b8eb67c3dA33339489e2804cb2e61e8681',
    },
    {
      name: 'Daan Poron',
      email: 'daan@settlemint.com',
      wallet: '0x41800A6d985C736942C098B54dC2a6508F05a1BB',
    },
    {
      name: 'Daan Poron',
      email: 'daan@poron.be',
      wallet: '0xb3B8cd0f4cc9c55D518cbbcEE4A836fa0C72e530',
    },
  ] as User[];

  const [step] = useQueryState('currentStep', {
    defaultValue: 1,
    parse: (value: string) => Number(value),
    serialize: (value: number) => String(value),
  });

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
        const createTokenResult = await createTokenAction(values);
        if (createTokenResult?.serverError || createTokenResult?.validationErrors) {
          throw new Error('Error creating token');
        }
        return waitForTransactionReceipt({
          receiptFetcher: async (): Promise<TransactionReceiptWithDecodedError | null | undefined> => {
            const transactionHash = createTokenResult?.data ?? '';
            if (!transactionHash) {
              return;
            }
            const txresult = await portalClient.request<TokenReceiptResponse>(CreateTokenReceiptQuery, {
              transactionHash,
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
    <div className="TokenizationWizard container mt-8 h-[calc(100vh-100px)] overflow-auto">
      <FormStepProgress steps={4} currentStep={step} complete={true} className="" />
      <Card
        className={cn(
          'w-full pt-10',
          'max-h-[calc(100vh-200px)]', // Limit card height
          'overflow-y-auto' // Enable vertical scrolling
        )}
      >
        <CardContent>
          <FormMultiStep<CreateTokenSchemaType>
            form={form}
            config={{ useLocalStorageState: false }}
            formId="create-token-form"
            onSubmit={onSubmit}
          >
            {/* Step 1 */}
            <FormStep
              form={form}
              fields={['tokenName', 'tokenSymbol']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
            >
              <CardTitle>Token basics</CardTitle>
              <CardDescription>Provide the general information required to define your token.</CardDescription>
              {/* Name */}
              <TextInput
                control={form.control}
                label="Name"
                name="tokenName"
                placeholder="e.g., My Stable Coin"
                showRequired
              />

              {/* Symbol */}
              <TextInput
                control={form.control}
                label="Symbol"
                name="tokenSymbol"
                placeholder="e.g., MSC"
                showRequired
              />

              {/* Decimals */}
              <NumericInput
                control={form.control}
                label="Decimals"
                name="decimals"
                placeholder="e.g., MSC"
                showRequired
              />

              {/* ISIN */}
              <TextInput control={form.control} label="ISIN" name="isin" placeholder="e.g., US1234567890" />

              <CardTitle className="!mt-16">Stable coin configuration</CardTitle>
              <CardDescription>Set parameters specific to your stable coin.</CardDescription>

              {/* Collateral Proof Validity (Seconds) */}
              <NumericInput
                control={form.control}
                label="Collateral Proof Validity (Seconds)"
                name="collateralProofValidity"
                placeholder="e.g., 3600"
                showRequired
              />

              {/* Token Logo */}
              {/*<FileInput
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
              />*/}
            </FormStep>

            {/* Step 2 */}
            <FormStep
              form={form}
              fields={['tokenName', 'tokenSymbol']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
            >
              <CardTitle>Token permissions</CardTitle>
              <CardDescription>Define administrative roles and permissions for managing this token.</CardDescription>

              {/* Token permissions */}
              <div className="flex flex-col gap-10">
                <TokenPermissionsInput users={_users.slice(2)} selectionValues={_users} control={form.control} />
              </div>
            </FormStep>
            <FormStep
              form={form}
              title="Review"
              controls={{
                prev: { buttonText: 'Back' },
                submit: { buttonText: 'Submit' },
              }}
            >
              <div>Review</div>
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
